const apiUrl = "http://industrial.api.ubidots.com/api/v1.6/devices/balanza";
const token = "BBUS-7TW8tdUSCVtJJy1RE6rt8cd8SUdX5h";

let alarmState = false;
let weightData = [];  // Arreglo para almacenar los últimos 10 valores de peso
const maxDataPoints = 10;

// Inicializar la gráfica de peso en tiempo real
const ctx = document.getElementById('weightChart').getContext('2d');
const weightChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: Array(maxDataPoints).fill(''), // Etiquetas vacías para 100 puntos
        datasets: [{
            label: 'Peso (kg)',
            data: weightData,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            fill: true,
        }]
    },
    options: {
        scales: {
            x: {
                display: false // Oculta las etiquetas del eje X
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Peso (kg)'
                }
            }
        }
    }
});

// Cargar el estado del paquete y de la alarma al iniciar
window.onload = () => {
    getPackageStatus();
    getAlarmStatus();
    setInterval(() => {
        getPackageStatus();
        getWeight();
    }, 1000); // Actualizar cada segundo
}

// Obtener el estado del paquete desde Ubidots
// Obtener el estado del paquete desde Ubidots
function getPackageStatus() {
    // Obtener el estado de "entrega"
    fetch(`${apiUrl}/entrega/lv`, {
        headers: {
            "X-Auth-Token": token,
        }
    })
    .then(response => response.text())
    .then(data => {
        const entrega = parseInt(data) === 1;
        let packageStatus = "No Entregado";
        let packageImage = "img/noEntregado.png";

        if (entrega) {
            packageStatus = "Entregado";
            packageImage = "img/entregado.png";
        }

        // Verificar "recolectado" y "robado" para actualizar la imagen y el texto
        return Promise.all([
            fetch(`${apiUrl}/recolectado/lv`, {
                headers: { "X-Auth-Token": token },
            }).then(response => response.text()),
            fetch(`${apiUrl}/robado/lv`, {
                headers: { "X-Auth-Token": token },
            }).then(response => response.text())
        ]).then(([recolectadoData, robadoData]) => {
            const recolectado = parseInt(recolectadoData) === 1;
            const robado = parseInt(robadoData) === 1;

            if (recolectado) {
                packageStatus = "Recolectado";
                packageImage = "img/recolectado.png";  // Imagen para "Recolectado"
            } else if (robado) {
                packageStatus = "Recolectado por tercero";
                packageImage = "img/robado.png";       // Imagen para "Robado"
            }

            // Actualizar elementos de la interfaz
            document.getElementById("packageStatus").innerText = packageStatus;
            document.getElementById("packageImage").src = packageImage;
        });
    })
    .catch(error => {
        console.error("Error al obtener el estado del paquete:", error);
    });
}


// Obtener el estado de la alarma desde Ubidots
function getAlarmStatus() {
    fetch(`${apiUrl}/alarma/lv`, {
        headers: {
            "X-Auth-Token": token,
        }
    })
    .then(response => response.text())
    .then(data => {
        alarmState = parseInt(data) === 1;
        updateAlarmButton();
    })
    .catch(error => {
        console.error("Error al obtener el estado de la alarma:", error);
    });
}

// Obtener el peso y actualizar la gráfica
function getWeight() {
    fetch(`${apiUrl}/peso/lv`, {
        headers: {
            "X-Auth-Token": token,
        }
    })
    .then(response => response.text())
    .then(data => {
        const weight = parseFloat(data);
        updateChart(weight);
    })
    .catch(error => {
        console.error("Error al obtener el peso:", error);
    });
}

// Actualizar la gráfica con el nuevo valor de peso
function updateChart(weight) {
    if (weightData.length >= maxDataPoints) {
        weightData.shift(); // Eliminar el primer valor si ya hay 100
    }
    weightData.push(weight);

    // Actualizar datos y redibujar el gráfico
    weightChart.data.labels = Array(weightData.length).fill('');
    weightChart.data.datasets[0].data = weightData;
    weightChart.update();
}

// Alternar la alarma
function toggleAlarm() {
    alarmState = !alarmState;
    const alarmValue = alarmState ? 1 : 0;

    fetch(`${apiUrl}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Auth-Token": token,
        },
        body: JSON.stringify({ alarma: alarmValue })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Alarma actualizada:", data);
        updateAlarmButton();
    })
    .catch(error => {
        console.error("Error al actualizar la alarma:", error);
    });
}

// Actualizar el texto del botón de alarma y el estado de la alarma en la interfaz
function updateAlarmButton() {
    const btn = document.getElementById("toggleAlarmBtn");
    btn.innerText = alarmState ? "Apagar" : "Encender";
    document.getElementById("alarmState").innerText = alarmState ? "Encendida" : "Apagada";
}

// Resetear el estado del paquete
function resetPackageStatus() {
    const resetData = {
        reset: 1,
        entrega: 0,
        robado: 0,
        recolectado: 0
    };

    fetch(`${apiUrl}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Auth-Token": token,
        },
        body: JSON.stringify(resetData)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Estado del paquete reseteado:", data);
    })
    .catch(error => {
        console.error("Error al resetear el estado del paquete:", error);
    });
}

// Función para iniciar la webcam
function startWebcam() {
    const video = document.getElementById('webcam');
    
    // Solicitar acceso a la cámara
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(error => {
            console.error("Error al acceder a la cámara:", error);
        });
}

// Iniciar la webcam al cargar la página
window.onload = () => {
    getPackageStatus();
    getAlarmStatus();
    startWebcam(); // Iniciar la cámara
    setInterval(() => {
        getPackageStatus();
        getWeight();
    }, 1000); // Actualizar cada segundo
};

let webcamEnabled = false;

// Inicializar webcam y sincronizar estado con Ubidots
window.onload = () => {
    getPackageStatus();
    getAlarmStatus();
    syncWebcamWithUbidots(); // Sincronizar estado de la cámara
    setInterval(() => {
        getPackageStatus();
        getWeight();
        syncWebcamWithUbidots(); // Verificar estado de la cámara cada segundo
    }, 1000); // Actualizar cada segundo
};

// Obtener el estado de la cámara desde Ubidots
function syncWebcamWithUbidots() {
    fetch(`${apiUrl}/camara/lv`, {
        headers: {
            "X-Auth-Token": token,
        }
    })
        .then(response => response.text())
        .then(data => {
            const ubidotsCamState = parseInt(data) === 1;
            if (ubidotsCamState !== webcamEnabled) {
                // Si el estado de Ubidots es diferente, sincronizarlo
                toggleWebcam(ubidotsCamState);
            }
        })
        .catch(error => {
            console.error("Error al sincronizar el estado de la cámara:", error);
        });
}

// Función para encender o apagar la cámara
function toggleWebcam(forceState = null) {
    const video = document.getElementById('webcam');
    const noSignal = document.getElementById('no-signal');
    const toggleButton = document.getElementById('toggleWebcamBtn');

    const newState = forceState !== null ? forceState : !webcamEnabled;

    if (newState) {
        // Encender la cámara
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                video.srcObject = stream;
                video.style.display = 'block'; // Mostrar el video
                noSignal.style.display = 'none'; // Ocultar "Sin señal"
                webcamEnabled = true;
                toggleButton.innerText = "Apagar Cámara"; // Cambiar texto del botón
            })
            .catch(error => {
                console.error("Error al acceder a la cámara:", error);
            });
    } else {
        // Apagar la cámara
        if (video.srcObject) {
            let tracks = video.srcObject.getTracks();
            tracks.forEach(track => track.stop()); // Detener los tracks
        }
        video.srcObject = null;
        video.style.display = 'none'; // Ocultar el video
        noSignal.style.display = 'flex'; // Mostrar "Sin señal"
        webcamEnabled = false;
        toggleButton.innerText = "Encender Cámara"; // Cambiar texto del botón
    }
}

// Manejar el botón de encender/apagar cámara manualmente
document.getElementById('toggleWebcamBtn').addEventListener('click', () => {
    toggleWebcam();
    updateCameraStateToUbidots(webcamEnabled ? 1 : 0); // Sincronizar con Ubidots
});

// Actualizar el estado de la cámara en Ubidots
function updateCameraStateToUbidots(state) {
    fetch(`${apiUrl}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Auth-Token": token,
        },
        body: JSON.stringify({ camara: state })
    })
        .then(response => response.json())
        .then(data => {
            console.log("Estado de la cámara actualizado en Ubidots:", data);
        })
        .catch(error => {
            console.error("Error al actualizar el estado de la cámara en Ubidots:", error);
        });
}
