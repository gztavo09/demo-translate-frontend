<template>
  <div id="app">
    <VoiceRecognition v-if="false"/>
    <VoiceAssembly v-if="false" />
    <VoiceSpeech />
  </div>
</template>

<script>
import VoiceRecognition from './components/VoiceRecognition.vue'
import VoiceAssembly from './components/VoiceAssembly'
import VoiceSpeech from './components/VoiceSpeech'
export default {
  name: 'App',
  components: {
    VoiceRecognition,
    VoiceAssembly,
    VoiceSpeech
  },
  data() {
    return {
      texto: 'HOla'
    }
  }
}
</script>