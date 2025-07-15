<template>
  <div class="error-container">
    <div class="stars-container">
      <div v-for="i in 50" :key="`star-${i}`" class="star"
        :style="{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${3 + Math.random() * 7}s`
        }"
      ></div>
    </div>

    <div class="tech-grid"></div>

    <div class="error-content">
      <div class="error-visual">
        <div class="glitch-container">
          <div class="glitch" data-text="404">404</div>
        </div>
        <div class="planet">
          <div class="ring"></div>
          <div class="cover-ring"></div>
          <div class="spots">
            <span v-for="i in 8" :key="`spot-${i}`"
              :style="{
                '--rotate': `${i * 45}deg`,
                '--delay': `${i * 0.1}s`
              }"
            ></span>
          </div>
        </div>
        <img class="astronaut" src="@/assets/images/404.png" alt="404 Astronaut">
        <div class="orbit">
          <img class="satellite" src="@/assets/images/404_cloud.png" alt="Satellite">
        </div>
      </div>

      <div class="error-message">
        <div class="message-content">
          <h2 class="oops">OOPS!</h2>
          <h3 class="headline">您访问的页面不存在</h3>
          <p class="info">请检查您输入的网址是否正确，或者返回首页继续浏览</p>
          <div class="actions">
            <router-link to="/" class="btn home-button">
              <i class="btn-icon home-icon"></i>
              <span class="button-content">返回首页</span>
            </router-link>
            <button class="btn back-button" @click="goBack">
              <i class="btn-icon back-icon"></i>
              <span class="button-content">返回上页</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="circuit-lines">
      <div v-for="i in 6" :key="`circuit-${i}`" class="circuit-line"
        :style="{
          top: `${15 * i}%`,
          width: `${150 + Math.random() * 200}px`,
          animationDelay: `${Math.random() * 2}s`
        }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.go(-1)
}
</script>

<style lang="less" scoped>
.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  background-color: #0d1117;
  position: relative;
  overflow: hidden;
  color: #fff;
  perspective: 1000px;
}

/* 星空背景 */
.stars-container {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.star {
  position: absolute;
  width: 2px;
  height: 2px;
  background-color: #fff;
  border-radius: 50%;
  opacity: 0;
  animation: twinkle 5s infinite;

  &:nth-child(3n) {
    width: 3px;
    height: 3px;
    box-shadow: 0 0 6px #fff;
  }

  &:nth-child(5n) {
    width: 1px;
    height: 1px;
    box-shadow: 0 0 4px #1482f0;
  }
}

/* 科技网格背景 */
.tech-grid {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(20, 130, 240, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(20, 130, 240, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridMove 60s linear infinite;
  opacity: 0.3;
  z-index: 1;
}

/* 电路线 */
.circuit-lines {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

.circuit-line {
  position: absolute;
  height: 2px;
  background: linear-gradient(90deg, transparent, #1482f0, transparent);
  opacity: 0.5;
  transform-origin: left;
  animation: circuitPulse 4s infinite ease-in-out;
  box-shadow: 0 0 8px #1482f0;

  &:nth-child(odd) {
    left: 0;
  }

  &:nth-child(even) {
    right: 0;
    background: linear-gradient(270deg, transparent, #1482f0, transparent);
  }
}

/* 主要内容 */
.error-content {
  display: flex;
  width: 1000px;
  max-width: 90%;
  z-index: 3;
  position: relative;
}

.error-visual {
  flex: 1;
  position: relative;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.glitch-container {
  position: absolute;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
}

.glitch {
  font-size: 100px;
  font-weight: 800;
  position: relative;
  color: #fff;
  text-shadow: 0 0 20px #1482f0;
  animation: glitch 2s ease-in-out infinite;

  &:before,
  &:after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  &:before {
    left: 2px;
    text-shadow: -2px 0 #ff00c1;
    animation: glitch-anim 2s infinite linear alternate-reverse;
    clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%, 0 60%, 100% 60%, 100% 100%, 0 100%);
  }

  &:after {
    left: -2px;
    text-shadow: 2px 0 #00fff9;
    animation: glitch-anim2 2s infinite linear alternate-reverse;
    clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%, 0 60%, 100% 60%, 100% 100%, 0 100%);
  }
}

.planet {
  position: absolute;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle at 30% 30%, #4facfe 0%, #00f2fe 90%);
  border-radius: 50%;
  box-shadow: 0 0 40px rgba(20, 130, 240, 0.8);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  overflow: hidden;
  animation: rotatePlanet 20s linear infinite;

  .ring {
    position: absolute;
    width: 200px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotateX(75deg);
    box-shadow: 0 0 20px rgba(20, 130, 240, 0.5);
    overflow: hidden;
    animation: rotateRing 10s linear infinite;

    &:after {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 4px solid rgba(255, 255, 255, 0.3);
      box-sizing: border-box;
    }
  }

  .cover-ring {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.3);
    z-index: 2;
  }

  .spots {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 1;

    span {
      position: absolute;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.3);
      transform-origin: center;
      transform: rotate(var(--rotate)) translateX(40px);
      animation: pulseSpot 3s infinite alternate;
      animation-delay: var(--delay);
    }
  }
}

.astronaut {
  position: absolute;
  width: 180px;
  height: auto;
  z-index: 4;
  animation: float 6s ease-in-out infinite;
}

.orbit {
  position: absolute;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: rotateOrbit 20s linear infinite;
}

.satellite {
  position: absolute;
  width: 40px;
  height: auto;
  top: -20px;
  left: calc(50% - 20px);
  animation: rotateSatellite 10s linear infinite;
}

.error-message {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px;
  position: relative;
}

.message-content {
  background: rgba(13, 17, 23, 0.7);
  backdrop-filter: blur(10px);
  padding: 30px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  animation: fadeIn 1s ease-out;
}

.oops {
  font-size: 36px;
  font-weight: 700;
  color: #1482f0;
  margin: 0 0 20px;
  text-shadow: 0 0 10px rgba(20, 130, 240, 0.5);
  animation: slideUp 0.8s ease-out;
}

.headline {
  font-size: 24px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 15px;
  animation: slideUp 0.8s ease-out 0.1s backwards;
}

.info {
  font-size: 16px;
  line-height: 1.6;
  color: #a0aec0;
  margin: 0 0 30px;
  animation: slideUp 0.8s ease-out 0.2s backwards;
}

.actions {
  display: flex;
  gap: 20px;
  animation: slideUp 0.8s ease-out 0.3s backwards;
}

.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 28px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  outline: none;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;

  .btn-icon {
    display: inline-block;
    width: 18px;
    height: 18px;
    margin-right: 8px;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    transition: transform 0.3s ease;
  }

  &:hover .btn-icon {
    transform: translateX(-3px);
  }
}

.home-button {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: #fff;
  box-shadow: 0 10px 20px rgba(79, 172, 254, 0.3);

  .home-icon {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'/%3E%3C/svg%3E");
  }

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0));
    transform: translateX(-100%);
    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 25px rgba(79, 172, 254, 0.4);

    &:before {
      transform: translateX(100%);
    }
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 5px 15px rgba(79, 172, 254, 0.4);
  }
}

.back-button {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);

  .back-icon {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M10 19l-7-7m0 0l7-7m-7 7h18'/%3E%3C/svg%3E");
  }

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(79, 172, 254, 0.2), rgba(0, 242, 254, 0.1));
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    border-color: rgba(79, 172, 254, 0.5);
    transform: translateY(-3px);

    &:before {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(1px);
  }
}

/* 动画定义 */
@keyframes twinkle {
  0%, 100% {
    opacity: 0;
    transform: scale(0.5);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes gridMove {
  0% { background-position: 0 0; }
  100% { background-position: 50px 50px; }
}

@keyframes circuitPulse {
  0% {
    transform: scaleX(0);
    opacity: 0;
  }
  50% {
    transform: scaleX(1);
    opacity: 0.5;
  }
  100% {
    transform: scaleX(0);
    opacity: 0;
  }
}

@keyframes glitch {
  0% {
    text-shadow: 0.05em 0 0 #00fff9, -0.05em -0.025em 0 #ff00c1;
  }
  14% {
    text-shadow: 0.05em 0 0 #00fff9, -0.05em -0.025em 0 #ff00c1;
  }
  15% {
    text-shadow: -0.05em -0.025em 0 #00fff9, 0.025em 0.025em 0 #ff00c1;
  }
  49% {
    text-shadow: -0.05em -0.025em 0 #00fff9, 0.025em 0.025em 0 #ff00c1;
  }
  50% {
    text-shadow: 0.025em 0.05em 0 #00fff9, 0.05em 0 0 #ff00c1;
  }
  99% {
    text-shadow: 0.025em 0.05em 0 #00fff9, 0.05em 0 0 #ff00c1;
  }
  100% {
    text-shadow: -0.025em 0 0 #00fff9, -0.025em -0.025em 0 #ff00c1;
  }
}

@keyframes glitch-anim {
  0% {
    clip-path: polygon(0 2%, 100% 0%, 100% 5%, 0% 15%, 0 70%, 100% 50%, 100% 100%, 0 100%);
  }
  50% {
    clip-path: polygon(0 15%, 100% 10%, 100% 30%, 0% 35%, 0 50%, 100% 70%, 100% 100%, 0 100%);
  }
  100% {
    clip-path: polygon(0 10%, 100% 15%, 100% 35%, 0% 30%, 0 70%, 100% 50%, 100% 100%, 0 100%);
  }
}

@keyframes glitch-anim2 {
  0% {
    clip-path: polygon(0 15%, 100% 10%, 100% 30%, 0% 35%, 0 90%, 100% 70%, 100% 100%, 0 100%);
  }
  50% {
    clip-path: polygon(0 5%, 100% 0%, 100% 20%, 0% 25%, 0 80%, 100% 70%, 100% 100%, 0 100%);
  }
  100% {
    clip-path: polygon(0 10%, 100% 5%, 100% 25%, 0% 20%, 0 80%, 100% 80%, 100% 100%, 0 100%);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes rotatePlanet {
  0% {
    transform: translate(-50%, -50%) rotate(0);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@keyframes rotateRing {
  0% {
    transform: translate(-50%, -50%) rotateX(75deg) rotate(0);
  }
  100% {
    transform: translate(-50%, -50%) rotateX(75deg) rotate(360deg);
  }
}

@keyframes rotateOrbit {
  0% {
    transform: translate(-50%, -50%) rotate(0);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@keyframes rotateSatellite {
  0% {
    transform: rotate(0) translateY(-140px) rotate(0);
  }
  100% {
    transform: rotate(360deg) translateY(-140px) rotate(-360deg);
  }
}

@keyframes pulseSpot {
  0%, 100% {
    opacity: 0.3;
    transform: rotate(var(--rotate)) translateX(40px) scale(1);
  }
  50% {
    opacity: 0.6;
    transform: rotate(var(--rotate)) translateX(40px) scale(1.2);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式适配 */
@media screen and (max-width: 1024px) {
  .error-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .error-visual {
    height: 300px;
    margin-bottom: 30px;
  }

  .glitch {
    font-size: 80px;
  }

  .planet {
    width: 100px;
    height: 100px;
  }

  .astronaut {
    width: 150px;
  }
}

@media screen and (max-width: 640px) {
  .error-visual {
    height: 250px;
  }

  .glitch {
    font-size: 60px;
  }

  .planet {
    width: 80px;
    height: 80px;
  }

  .astronaut {
    width: 120px;
  }

  .orbit {
    width: 200px;
    height: 200px;
  }

  .satellite {
    width: 30px;
  }

  .oops {
    font-size: 28px;
  }

  .headline {
    font-size: 20px;
  }

  .info {
    font-size: 14px;
  }

  .actions {
    flex-direction: column;
    gap: 15px;
    width: 100%;
  }

  .btn {
    width: 100%;
    padding: 14px 20px;
  }
}
</style>
