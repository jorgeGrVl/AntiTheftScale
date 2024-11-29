#include <HX711.h>
#include <WiFi.h>
#include <HTTPClient.h>

// Definición de pines
#define PIN_DT  33           // Pin de datos del HX711
#define PIN_SCK 32           // Pin de reloj del HX711
#define LED_PIN 5           // Pin del LED
#define BUZZER_PIN 25        // Pin del buzzer
#define TRIG_PIN 27          // Pin TRIG del sensor ultrasónico
#define ECHO_PIN 26          // Pin ECHO del sensor ultrasónico

// Credenciales de WiFi
const char* ssid = "Tec-IoT";             
const char* password = "spotless.magnetic.bridge";       

// Token de Ubidots y URL de la API
const char* token = "BBUS-7TW8tdUSCVtJJy1RE6rt8cd8SUdX5h";   
const char* deviceName = "balanza"; 
const char* variableNamePeso = "peso";    
const char* variableNameAlarma = "alarma"; 
const char* variableNameReset = "reset";   
const char* variableNameCamara = "camara";
String serverName = "http://industrial.api.ubidots.com/api/v1.6/devices/" + String(deviceName);

// Inicialización del sensor HX711
HX711 scale;

float pesoActual = 0;
float pesoUmbral = 0.5;                   
bool pesoPresente = 0;                
bool alarma = false;           
int recolectado = 0;
int robado = 0;
int reset = 0;
bool resetPackage = false;
int camara = 0;

void setup() {
    Serial.begin(9600);

    // Configuración de pines
    pinMode(LED_PIN, OUTPUT);
    pinMode(BUZZER_PIN, OUTPUT);
    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);

    // Inicialización del HX711
    scale.begin(PIN_DT, PIN_SCK);
    scale.tare();                         
    scale.set_scale(-101052);             

    // Apagar LED y buzzer al inicio
    digitalWrite(LED_PIN, LOW);
    digitalWrite(BUZZER_PIN, LOW);

    // Conexión WiFi
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.println("Conectando a WiFi...");
    }
    Serial.println("Conectado a WiFi");
}

void loop() {
    // Leer el peso de la balanza
    if (scale.is_ready()) {
        pesoActual = scale.get_units(5);  
        Serial.print("Peso detectado: ");
        Serial.println(pesoActual);

        if (pesoActual > pesoUmbral) {
            pesoPresente = 1;
            digitalWrite(BUZZER_PIN, LOW);
        } else {
            if (pesoPresente == 1 && alarma) {
                digitalWrite(LED_PIN, HIGH);
                robado = 1;
                unsigned long startTime = millis();
                while (millis() - startTime < 5000) {
                    tone(BUZZER_PIN, 4000);
                    delay(300);
                    tone(BUZZER_PIN, 3000);
                    delay(200);
                    noTone(BUZZER_PIN);
                    delay(150);
                }
                pesoPresente = 0;
                digitalWrite(LED_PIN, LOW);
            } else if (pesoPresente == 1 && !alarma) {
                recolectado = 1;
                pesoPresente = 0;
            }
        }
    } else {
        Serial.println("Esperando a que el sensor esté listo...");
    }

    // Leer valor de reset desde Ubidots
    resetPackage = obtenerEstadoReset();
    if (resetPackage) {
        pesoPresente = 0;
        recolectado = 0;
        robado = 0;
        reset = 0;
        enviarResetAUbidots(reset);
    }

    // Leer la distancia del sensor ultrasónico
    camara = leerSensorUltrasonico();

    // Enviar datos a Ubidots
    enviarDatosAUbidots(pesoActual, pesoPresente, recolectado, robado, camara);
    // Leer el estado de la alarma desde Ubidots
    alarma = obtenerEstadoAlarma();

    delay(1000);  
}

// Función para enviar las variables a Ubidots
void enviarDatosAUbidots(float peso, int entrega, int recolectado, int robado, int camara) {
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(serverName);
        http.addHeader("Content-Type", "application/json");
        http.addHeader("X-Auth-Token", token);

        // Crear el JSON con todas las variables
        String jsonPayload = "{";
        jsonPayload += "\"" + String(variableNamePeso) + "\": " + String(peso) + ",";
        jsonPayload += "\"entrega\": " + String(entrega ? 1 : 0) + ",";
        jsonPayload += "\"recolectado\": " + String(recolectado ? 1 : 0) + ",";
        jsonPayload += "\"robado\": " + String(robado ? 1 : 0) + ",";
        jsonPayload += "\"" + String(variableNameCamara) + "\": " + String(camara ? 1 : 0);
        jsonPayload += "}";

        int httpResponseCode = http.POST(jsonPayload);
        if (httpResponseCode > 0) {
            Serial.print("Respuesta de Ubidots: ");
            Serial.println(httpResponseCode);
        } else {
            Serial.print("Error al enviar: ");
            Serial.println(http.errorToString(httpResponseCode).c_str());
        }
        
        http.end();
    } else {
        Serial.println("WiFi desconectado. No se pudo enviar el dato.");
    }
}

// Función para leer el sensor ultrasónico
int leerSensorUltrasonico() {
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);

    long duration = pulseIn(ECHO_PIN, HIGH);
    int distance = duration * 0.034 / 2;  

    Serial.print("Distancia detectada: ");
    Serial.print(distance);
    Serial.println(" cm");

    return distance < 100 ? 1 : 0;  
}

void enviarResetAUbidots(int reset) {
  if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(serverName);
        http.addHeader("Content-Type", "application/json");
        http.addHeader("X-Auth-Token", token);

        // Crear el JSON con todas las variables
        String jsonPayload = "{";
        jsonPayload += "\"reset\": " + String(reset ? 1 : 0);
        jsonPayload += "}";

        // Enviar la solicitud POST
        int httpResponseCode = http.POST(jsonPayload);
        if (httpResponseCode > 0) {
            Serial.print("Respuesta de Ubidots: ");
            Serial.println(httpResponseCode);
        } else {
            Serial.print("Error al enviar: ");
            Serial.println(http.errorToString(httpResponseCode).c_str());
        }
        
        http.end();
    } else {
        Serial.println("WiFi desconectado. No se pudo enviar el dato.");
    }
}

// Función para obtener el estado de la alarma desde Ubidots
bool obtenerEstadoAlarma() {
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(serverName + "/" + variableNameAlarma + "/lv");
        http.addHeader("X-Auth-Token", token);

        int httpResponseCode = http.GET();
        if (httpResponseCode > 0) {
            String payload = http.getString();
            Serial.print("Estado de alarma desde Ubidots: ");
            Serial.println(payload);
            return payload.toInt() == 1;
        } else {
            Serial.print("Error al obtener estado de alarma: ");
            Serial.println(http.errorToString(httpResponseCode).c_str());
        }
        
        http.end();
    } else {
        Serial.println("WiFi desconectado. No se pudo obtener el estado de la alarma.");
    }
    return false;
}

// Función para obtener el valor de reset desde Ubidots
bool obtenerEstadoReset() {
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(serverName + "/" + variableNameReset + "/lv");
        http.addHeader("X-Auth-Token", token);

        int httpResponseCode = http.GET();
        if (httpResponseCode > 0) {
            String payload = http.getString();
            Serial.print("Valor de reset desde Ubidots: ");
            Serial.println(payload);
            return payload.toInt() == 1;
        } else {
            Serial.print("Error al obtener valor de reset: ");
            Serial.println(http.errorToString(httpResponseCode).c_str());
        }
        
        http.end();
    } else {
        Serial.println("WiFi desconectado. No se pudo obtener el valor de reset.");
    }
    return false;
}