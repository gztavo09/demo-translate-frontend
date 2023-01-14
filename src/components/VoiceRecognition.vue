<template>
  <div>
    <p>Texto a convetir: {{ inputText }}</p>
    <p>Texto traducido: {{ convertedText }}</p>
    <p>Idioma: {{ language }}</p>
    <button @click="initVoice()">Hablar</button>
  </div>
</template>

<script>
import '../utils/voice.js';
import axios from 'axios';
import LanguageDetect from 'languagedetect'

export default {
  data() {
    return {
        inputText: '',
        convertedText: '',
        language: '',
    }
  },
  methods: {
    speak(text) {
        responsiveVoice.speak(text);
        annyang.abort()
    },
    processText() {
        let prefix = "Traduce '" + this.inputText + "' al Inglés"
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
            this.speak(new_text)
        });
    },
    initVoice() {
        let _this = this;
        let commands = {
            '*text': function(text) {
                console.log('You said: ' + text);
                _this.inputText = text;
            }
        }
        annyang.addCommands(commands);
        annyang.start();
        
    },
    langDetector(text) {
        const lngDetector = new LanguageDetect();
        this.language = lngDetector.detect(text)[0][0]
        console.log(this.language);
        this.processText()
    }
  },
  watch: {
    inputText(val) {
       
        if(val.length != 0) {
            this.langDetector(val)
        } 
    }
  },
}
</script>