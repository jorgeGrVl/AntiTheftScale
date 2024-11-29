# **Varos: Sistema IoT para la Seguridad de Paquetes**  
**Por Moth Co.**  
*"Dándole peso a tu seguridad"*  

---

## **1. Bienvenida**  

¡Bienvenido a **Varos**, el innovador sistema IoT que lleva la seguridad de tus paquetes al siguiente nivel! En **Moth Co.**, entendemos la importancia de proteger tus entregas, especialmente cuando no estás en casa. Por ello, hemos diseñado esta solución integral que combina sensores avanzados, conectividad en la nube y una interfaz amigable para ofrecerte tranquilidad y control total, sin importar dónde te encuentres.

**Varos** no solo es un producto, sino una experiencia. Está pensado para ser fácil de instalar, intuitivo de usar y altamente eficiente. Este manual tiene como objetivo guiarte en cada paso, desde la configuración inicial hasta la resolución de problemas, para que puedas aprovechar al máximo sus capacidades.

En **Moth Co.**, creemos que la tecnología debe trabajar para ti, simplificando tu vida y asegurando lo que más valoras. Nuestro sistema detecta cualquier actividad sospechosa, registra cambios en el peso de los paquetes y envía notificaciones en tiempo real para que siempre estés informado. Además, su diseño modular permite adaptarse a diferentes entornos y necesidades, desde hogares hasta oficinas o almacenes pequeños.

Sabemos que la seguridad no solo es una prioridad, sino una necesidad. Por ello, te agradecemos por confiar en **Varos** como tu aliado tecnológico. Nuestro compromiso es proporcionarte un producto confiable, accesible e innovador que refleje nuestra pasión por mejorar la vida de las personas a través de la tecnología.

---

## **2. Requisitos previos**  

### **Hardware necesario**  
- ESP32.  
- Módulo HX711 y celda de carga (20 kg).  
- Sensor ultrasónico HC-SR04.  
- Buzzer (zumbador).  
- Placa de pruebas (protoboard) y cables jumper.  
- Opcional: Cámara compatible con ESP32.  

### **Software necesario**  
- Arduino IDE.  
- Bibliotecas necesarias:  
  - ESP32.  
  - HX711.  
  - WiFiClientSecure.  
- Cuenta en UbiDots para manejo de datos en la nube.  

---

## **3. Primeros pasos**  

### **Configuración del hardware:**  

1. **Coloca el ESP32 en la protoboard:**  
   - Asegúrate de que los pines estén correctamente alineados.  

2. **Conecta la celda de carga al módulo HX711:**  
   - La celda de carga tiene cuatro cables:  
     - **Rojo:** E+  
     - **Negro:** E-  
     - **Blanco:** A-  
     - **Verde:** A+  

3. **Conecta el módulo HX711 al ESP32:**  
   - **DT al GPIO 33.**  
   - **SCK al GPIO 32.**  

4. **Conecta el sensor ultrasónico HC-SR04:**  
   - **Trig al GPIO 27.**  
   - **Echo al GPIO 26.**  

5. **Conecta el buzzer:**  
   - **Positivo al GPIO 25.**  

6. **Verifica todas las conexiones:**  
   - Asegúrate de que no haya cables sueltos.  

---

### **Configuración del software:**  

1. **Descargar e instalar Arduino IDE:**  
   - Descárgalo desde [aquí](https://www.arduino.cc/en/software).  

2. **Agregar soporte para ESP32:**  
   - En el gestor de placas, agrega:  
     ```  
     https://dl.espressif.com/dl/package_esp32_index.json  
     ```  

3. **Instalar bibliotecas:**  
   - Busca e instala "HX711" y "WiFiClientSecure" desde el gestor de bibliotecas.  

4. **Editar el código:**  
   - Configura tu red Wi-Fi:  
     ```cpp
     const char* ssid = "TuRedWiFi";
     const char* password = "TuContraseña";
     ```  
   - Agrega el token de UbiDots:  
     ```cpp
     const char* token = "TuTokenUbidots";
     ```  

5. **Cargar el código:**  
   - Conecta el ESP32 y selecciona el puerto correspondiente.  
   - Sube el código.  

---

## **4. Funciones del sistema**  

### **Monitoreo de peso:**  
- Detecta y registra cambios en el peso del paquete.  

### **Alarmas y notificaciones:**  
- Activa alarmas sonoras al detectar manipulación.  

### **Detección de proximidad:**  
- El sensor ultrasónico detecta movimiento cercano.  

### **Cámara en vivo:**  
- Proporciona video en tiempo real si está configurada.  

### **Conectividad con UbiDots:**  
- Almacena y analiza datos en la nube.  

---

## **5. Interfaz web**  

1. **Estado del paquete:**  
   - Indica si el paquete está presente, recolectado o manipulado.  

2. **Control de la alarma:**  
   - Permite encender o apagar la alarma.  

3. **Gráfica de peso:**  
   - Muestra el peso en tiempo real.  

4. **Cámara en vivo:**  
   - Transmisión de video para supervisión.  

---

## **6. Solución de problemas**  

### **Errores comunes y soluciones:**  

#### **1. El sistema no detecta peso correctamente:**  
- Verifica las conexiones y calibra la celda de carga.  

#### **2. El buzzer no suena:**  
- Confirma que el buzzer está conectado correctamente.  

#### **3. No hay conexión a Wi-Fi:**  
- Revisa el SSID y la contraseña.  

#### **4. No se reciben notificaciones:**  
- Verifica el token de UbiDots y la conexión.  

---

## **7. Notas finales**  

**Varos** está diseñado para simplificar la seguridad de tus paquetes. Si tienes sugerencias o encuentras áreas de mejora, comparte tus comentarios para ayudarnos a crecer y seguir innovando.  

---  
