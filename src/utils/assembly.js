let mediaRecorder = null;
let id = "";
const openMicro = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        const chunks = [];
      
        mediaRecorder.start();
      
        mediaRecorder.addEventListener("dataavailable", event => {
          chunks.push(event.data);
        });
      
        mediaRecorder.addEventListener("stop", () => {
          const audioBlob = new Blob(chunks);
          // Subir archivo a Cloudinary
          const formData = new FormData();
          formData.append('file', audioBlob);
          formData.append('upload_preset', 'l2of2s9x');
          fetch('https://api.cloudinary.com/v1_1/dhdyxbbi6/upload', {
            method: 'POST',
            body: formData
          })
          .then(response => response.json())
          .then(data => {
            // Obtener URL del archivo subido
            const audioUrl = data.secure_url;
            
            // Hacer solicitud a la API de Assembly AI
            fetch('https://api.assemblyai.com/v2/transcript', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': '0f80a16b8a65424f980f8a9d231fe973'
              },
              body: JSON.stringify({
                "audio_url": audioUrl
              })
            })
            .then(response => response.json())
            .then(data => {
            //   console.log(data.transcript);
                id = data.id;
                GET_TEXT_BY_AUDIO()
            })
            .catch(error => {
              console.error('Error:', error);
            });
          })
          .catch(error => {
            console.error('Error:', error);
          });
        });
      
        // Stop recording after 5 seconds
        setTimeout(() => {
          mediaRecorder.stop();
        }, 5000);
      });
}

const GET_TEXT_BY_AUDIO = () => {
    fetch('https://api.assemblyai.com/v2/transcript/' + id, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': '0f80a16b8a65424f980f8a9d231fe973'
        }
      })
      .then(response => response.json())
      .then(data => {
        if(data.status == "processing") {
            GET_TEXT_BY_AUDIO();
        } else {
            console.log(data);
        }
        
      })
      .catch(error => {
        console.error('Error:', error);
      });
}



  export { openMicro, mediaRecorder } 
  