// Função para converter um arquivo em Base64
function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result); // Retorna o resultado em base64
        reader.onerror = error => reject(error); // Trata erros de leitura
    });
}

// Função para coletar dados do formulário
async function collectData() {
    try {
        const formData = {
            status: document.querySelector('input[name="status"]:checked')?.value,
            empresa: document.getElementById('empresa').value,
            escopo: document.getElementById('escopo').value,
            localnc: document.getElementById('localnc').value,
            respfrente: document.getElementById('respfrente').value,
            tipo: Array.from(document.querySelectorAll('input[name="tipo"]:checked'), input => input.value),
            natureza: Array.from(document.querySelectorAll('input[name="natureza"]:checked'), input => input.value),
            obra: Array.from(document.querySelectorAll('input[name="obra"]:checked'), input => input.value),
            grau: document.querySelector('input[name="grau"]:checked')?.value,
            myTextarea: document.getElementById('myTextarea').value,
            figura1: document.getElementById('figura1').value,
            figura2: document.getElementById('figura2').value,
            img1: await getBase64(document.getElementById('fileInput1').files[0]),
            img2: await getBase64(document.getElementById('fileInput2').files[0])
        };

        // Coloca a string JSON no campo de entrada para envio
        document.getElementById('jsonData').value = JSON.stringify(formData);
    } catch (error) {
        console.error("Erro ao coletar dados:", error);
    }
}

// Função para preencher os dados no formulário a partir de um JSON
function fillData(data) {
    const formData = JSON.parse(data);

    document.querySelector(`input[name="status"][value="${formData.status}"]`).checked = true;
    document.getElementById('empresa').value = formData.empresa;
    document.getElementById('escopo').value = formData.escopo;
    document.getElementById('localnc').value = formData.localnc;
    document.getElementById('respfrente').value = formData.respfrente;

    formData.tipo.forEach(value => {
        document.querySelector(`input[name="tipo"][value="${value}"]`).checked = true;
    });

    formData.natureza.forEach(value => {
        document.querySelector(`input[name="natureza"][value="${value}"]`).checked = true;
    });

    formData.obra.forEach(value => {
        document.querySelector(`input[name="obra"][value="${value}"]`).checked = true;
    });

    document.querySelector(`input[name="grau"][value="${formData.grau}"]`).checked = true;

    // Preenche campos de texto
    document.getElementById('myTextarea').value = formData.myTextarea;
    document.getElementById('figura1').value = formData.figura1;
    document.getElementById('figura2').value = formData.figura2;
    
    // Cria botão para download das imagens
    const button = document.createElement("button");
    button.innerHTML = "Baixar Imagens";
    document.body.appendChild(button);

    button.addEventListener("click", function() {
        downloadImage(formData.img1, 'img1.png');
        downloadImage(formData.img2, 'img2.png');
    });
}

// Função para baixar a imagem
function downloadImage(data, filename) {
    const blob = dataURItoBlob(data);
    const url = window.URL || window.webkitURL;
    const link = document.createElement('a');
    link.href = url.createObjectURL(blob);
    link.download = filename || 'download';

    const click = document.createEvent("Event");
    click.initEvent("click", true, true);
    link.dispatchEvent(click);
}

// Função para converter dataURI em Blob
function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}

// Funções para carregar imagens no formulário
function loadImage1(event) {
    const reader = new FileReader();
    reader.onload = function() {
        document.getElementById('img1').src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
}

function loadImage2(event) {
    const reader = new FileReader();
    reader.onload = function() {
        document.getElementById('img2').src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
}

// Função para gerar um PDF a partir de um conteúdo da página
$(document).ready(function() {
    $("#downloadPDF").click(function() {
        const content = document.getElementById("content");
        const width = content.offsetWidth;
        const height = content.offsetHeight;

        // Redimensiona a div para o tamanho de uma folha A4 (595x842 px)
        content.style.width = "750px";
        content.style.height = "1400px";

        html2canvas(content, {
            scale: 10 // Aumenta a escala para melhorar a qualidade
        }).then(function(canvas) {
            const imgData = canvas.toDataURL('image/png');
            const doc = new jsPDF('p', 'mm', [595, 842]); // Define o formato de página para A4
            doc.addImage(imgData, 'PNG', 1, 1, 210, 297); // Insere a imagem no PDF

            doc.save('sample.pdf');

            // Restaura o tamanho original da div
            content.style.width = `${width}px`;
            content.style.height = `${height}px`;
        });
    });
});

// Função para capturar a localização geográfica do usuário
window.onload = getMyLocation;

function getMyLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        document.getElementById('localnc').value = "Geolocalização não é suportada por este navegador.";
    }
}

function showPosition(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.address) {
                const road = data.address.road || "N/A";
                const neighbourhood = data.address.neighbourhood || "N/A";
                const city = data.address.city || data.address.town || "N/A";
                const state = data.address.state || "N/A";
                const formattedLocation = `${road}, ${neighbourhood}, ${city}, ${state}, ${latitude}, ${longitude}`;
                document.getElementById('localnc').value = formattedLocation;
            } else {
                throw new Error("Não foi possível obter o endereço.");
            }
        })
        .catch(error => {
            document.getElementById('localnc').value = error.message;
        });
}

function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            document.getElementById('localnc').value = "Usuário negou a solicitação de Geolocalização.";
            break;
        case error.POSITION_UNAVAILABLE:
            document.getElementById('localnc').value = "Informação de localização está indisponível.";
            break;
        case error.TIMEOUT:
            document.getElementById('localnc').value = "A solicitação para obter a localização do usuário expirou.";
            break;
        case error.UNKNOWN_ERROR:
            document.getElementById('localnc').value = "Ocorreu um erro desconhecido.";
            break;
    }
}

