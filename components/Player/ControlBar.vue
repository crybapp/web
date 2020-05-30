<template>
	<div class="control-bar">
    <div class="control-inner">
    	<div class="volume-controls">
      <img v-if="!this.isStreamMuted" src="/icons/speaker-unmuted.svg" alt="" class="icon" @click="toggleStreamMute"/>
      <img v-else src="/icons/speaker-muted.svg" alt="" class="icon" @click="toggleStreamMute"/>
      <input 
        v-model="volumeValue"
        class="volume-slider" 
        type="range" 
        min="0" 
        max="100" 
        value=100 
        step="1"
        @input="volumeChanged"
      />
    </div>
    <img src="/icons/fullscreen.svg" alt="" class="fullscreen-toggle icon" @click="toggleFullscreen"/>
    </div>
	</div>
</template>

<script>
	export default {
    methods: {
      toggleStreamMute() {
	      this.isStreamMuted = !this.isStreamMuted
	      this.$store.commit('setMutedStatus', this.isStreamMuted)
      },
      volumeChanged() {
        this.$store.commit('setViewerVolume', this.volumeValue)
      },
      toggleFullscreen() {
        this.$root.$emit('toggle-fullscreen')
      }
    }
	}
</script>
