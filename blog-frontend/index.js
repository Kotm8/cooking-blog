const bgVideo = document.getElementById('bgVideo');

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY; 
  const maxScroll = 400;            
  const minBrightness = 0.05;        
  const maxBrightness = 0.3;        

  let brightness = maxBrightness - (scrollTop / maxScroll) * (maxBrightness - minBrightness);

  brightness = Math.max(minBrightness, Math.min(maxBrightness, brightness));

  bgVideo.style.filter = `brightness(${brightness})`;
});