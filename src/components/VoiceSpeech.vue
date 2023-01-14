<template>
    <div>   
        <div class="text-center p-4 d-flex">
            <button @click="initVoice()" class="bg-yellow-500 text-black rounded-lg p-4 shadow-lg hover:shadow-2xl">
                <i class="fas fa-microphone"></i>
                Hablar
            </button>
            <button @click="stopVoice()" class="bg-black text-white rounded-lg p-4 shadow-lg hover:shadow-2xl">
                <i class="fas fa-stop"></i>
                Detener
            </button>
            <button @click="cleanVoice()" class="bg-default text-black rounded-lg p-4 shadow-lg hover:shadow-2xl">
                <i class="fas fa-clean"></i>
                Limpiar
            </button>
            
            <div class="text-center py-4">
                <label>Traducir al:</label>
                <select v-model="selectLang" class="bg-white rounded-lg p-2 shadow-lg">
                    <option value="es-ES">Español</option>
                    <option value="en-US">Inglés</option>
                </select>
            </div>
        </div>
        <div class="bg-yellow-100 rounded-lg p-4">
            <h3 class="text-black">Texto grabado:</h3>
            <p class="text-black">{{ recordedText }}</p>
        </div>
        <br>
        <div class="bg-black text-white rounded-lg p-4">
            <h3>Texto traducido:</h3>
            <p>{{ convertedText }}</p>
        </div>
        <hr>
        <p>Idioma detectado: {{ language }}</p>
    </div>
    
</template>

<script>
import '../utils/voice.js';
import recognition from '../utils/speech'
import axios from 'axios';
import LanguageDetect from 'languagedetect'
import socket from '../socket/io'

export default {
  data() {
    return {
        recordedText: '',
        convertedText: '',
        language: '',
        selectLang: 'en-US',
        id: 0
    }
  },
  methods: {
    speak(text) {
        responsiveVoice.speak(text, (this.selectLang == 'en-US' ? "UK English Male" : "Spanish Latin American Male"));
        annyang.abort()
    },
    processText() {
        let prefix = "Traduce '" + this.recordedText + "' al " + (this.selectLang == 'en-US' ? 'Inglés' : 'Español')
        const bodyParameters = {
            "model": "text-davinci-003",
            "prompt": prefix,
            "max_tokens": 100,
            "temperature": 0,
            "top_p": 1,
            "n": 1,
            "stream": false
        };

        const config = {
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer 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` 
            }
        };

        axios.post('https://api.openai.com/v1/completions',
            bodyParameters,
            config
        ).then((response) => {
            let new_text = response.data.choices[0].text.replaceAll("\n", "")
            this.convertedText = new_text
            socket.emit('send message', {
                id: this.id,
                text: new_text
              }
            );
            
        });
    },
    langDetector(text) {
        const lngDetector = new LanguageDetect();
        this.language = lngDetector.detect(text)[0][0]
        this.processText()
    },
    

    initVoice() {
        let _this = this;
        recognition.onstart = function() {
            console.log('Recognition started');
        }
        
        recognition.onresult = function(event) {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                transcript += event.results[i][0].transcript;
            }
            }
            _this.recordedText = transcript;
        }
        
        recognition.onerror = function(event) {
            console.log('Recognition error: ' + event.error);
        }
        
        recognition.onend = function() {
            console.log('Recognition stopped');
        }
        
        recognition.start();
    },
    stopVoice () {
        recognition.stop();
    },
    cleanVoice() {
        this.recordedText = ''
        this.convertedText = ''
        this.language = ''
    }
  },
  watch: {
    recordedText(val) {
        if(val.length != 0) {
            this.langDetector(val)
        } 
    }
  },
  mounted() {
    socket.on('new message', value => {
      if(value.id != this.id) {
        console.log(1, value);
        this.speak(value.text)
      }
    });
  },
  created() {
    this.id = Date.now()
  }
}
</script>

<style>
.text-center {
  text-align: center;
}

.bg-yellow-500 {
  background-color: #ffc107;
}

.bg-black {
  background-color: #000;
}

.text-black {
  color: #000;
}

.text-white {
  color: #fff;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.p-4 {
  padding: .5rem;
}

.bg-yellow-100 {
  background-color: #fffde7;
}
.shadow-lg {
  box-shadow: 0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05);
}
.hover:shadow-2xl {
  transition: all 0.2s ease;
}
.hover:shadow-2xl:hover {
  box-shadow: 0px 25px 50px -12px rgba(0, 0, 0, 0.25);
}
label {
  font-weight: bold;
  margin-right: 1rem;
}
select {
  font-size: 1rem;
  width: 150px;
}

.d-flex {
    display: flex;
    align-items: center;
}

.d-flex button {
    margin-right: 15px;
}
</style>