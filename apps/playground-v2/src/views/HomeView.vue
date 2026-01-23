<template>
  <div class="home-view">
    <div class="container">
      <h1>🎥 Video Call UI Kit V2</h1>
      <p class="subtitle">Choose a demo to explore the V2 components</p>

      <div class="demo-cards">
        <!-- Simple Demo -->
        <div class="demo-card" @click="goToSimple">
          <div class="card-icon">🚀</div>
          <h2>Simple Integration</h2>
          <p>
            One-component solution with <code>DiagVideoCallV2</code>.
            Perfect for quick integration.
          </p>
          <ul>
            <li>✓ All-in-one component</li>
            <li>✓ Built-in prejoin flow</li>
            <li>✓ Automatic state management</li>
            <li>✓ Virtual backgrounds</li>
          </ul>
          <button class="btn primary">Try Simple Demo →</button>
        </div>

        <!-- Custom Demo -->
        <div class="demo-card" @click="goToCustom">
          <div class="card-icon">🎨</div>
          <h2>Custom Integration</h2>
          <p>
            Build your own UI with individual components.
            Maximum flexibility.
          </p>
          <ul>
            <li>✓ Full control over layout</li>
            <li>✓ Custom video grid</li>
            <li>✓ Custom controls</li>
            <li>✓ Custom panels</li>
          </ul>
          <button class="btn secondary">Try Custom Demo →</button>
        </div>

        <!-- Step-by-Step Demo -->
        <div class="demo-card" @click="goToPrejoin">
          <div class="card-icon">📋</div>
          <h2>Step-by-Step Flow</h2>
          <p>
            Separate views for prejoin and in-call.
            Traditional routing approach.
          </p>
          <ul>
            <li>✓ Separate prejoin page</li>
            <li>✓ Router-based navigation</li>
            <li>✓ Mock & Agora modes</li>
            <li>✓ Device selection</li>
          </ul>
          <button class="btn outline">Try Step-by-Step →</button>
        </div>
      </div>

      <!-- Features Section -->
      <div class="features-section">
        <h2>V2 Features</h2>
        <div class="features-grid">
          <div class="feature">
            <span class="feature-icon">🎬</span>
            <span>Virtual Background</span>
          </div>
          <div class="feature">
            <span class="feature-icon">✨</span>
            <span>Beauty Effects</span>
          </div>
          <div class="feature">
            <span class="feature-icon">🔇</span>
            <span>Noise Suppression</span>
          </div>
          <div class="feature">
            <span class="feature-icon">⏺️</span>
            <span>Recording</span>
          </div>
          <div class="feature">
            <span class="feature-icon">📺</span>
            <span>Live Streaming</span>
          </div>
          <div class="feature">
            <span class="feature-icon">📝</span>
            <span>Transcription</span>
          </div>
          <div class="feature">
            <span class="feature-icon">💬</span>
            <span>Chat</span>
          </div>
          <div class="feature">
            <span class="feature-icon">🚪</span>
            <span>Waiting Room</span>
          </div>
          <div class="feature">
            <span class="feature-icon">🖥️</span>
            <span>Screen Share</span>
          </div>
          <div class="feature">
            <span class="feature-icon">📌</span>
            <span>Pin Participant</span>
          </div>
          <div class="feature">
            <span class="feature-icon">📐</span>
            <span>Multiple Layouts</span>
          </div>
          <div class="feature">
            <span class="feature-icon">🌍</span>
            <span>i18n (EN/VI)</span>
          </div>
        </div>
      </div>

      <!-- Language Switcher -->
      <div class="language-section">
        <span>Language:</span>
        <button
          :class="['lang-btn', { active: locale === 'en' }]"
          @click="setLocale('en')"
        >
          English
        </button>
        <button
          :class="['lang-btn', { active: locale === 'vi' }]"
          @click="setLocale('vi')"
        >
          Tiếng Việt
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { locale } = useI18n();

const goToSimple = () => router.push('/simple');
const goToCustom = () => router.push('/custom');
const goToPrejoin = () => router.push('/prejoin');

const setLocale = (lang: string) => {
  locale.value = lang;
};
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

h1 {
  font-size: 2.5rem;
  color: white;
  margin-bottom: 8px;
}

.subtitle {
  color: rgba(255, 255, 255, 0.85);
  font-size: 1.2rem;
  margin-bottom: 40px;
}

.demo-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 60px;
}

.demo-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.demo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.card-icon {
  font-size: 2.5rem;
  margin-bottom: 16px;
}

.demo-card h2 {
  font-size: 1.4rem;
  color: #333;
  margin-bottom: 12px;
}

.demo-card p {
  color: #666;
  margin-bottom: 16px;
  line-height: 1.5;
}

.demo-card code {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}

.demo-card ul {
  list-style: none;
  margin-bottom: 20px;
}

.demo-card li {
  color: #555;
  padding: 4px 0;
}

.btn {
  width: 100%;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn.primary:hover {
  opacity: 0.9;
}

.btn.secondary {
  background: #333;
  color: white;
}

.btn.secondary:hover {
  background: #444;
}

.btn.outline {
  background: transparent;
  border: 2px solid #667eea;
  color: #667eea;
}

.btn.outline:hover {
  background: #667eea;
  color: white;
}

.features-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 40px;
}

.features-section h2 {
  color: white;
  margin-bottom: 24px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.feature {
  background: rgba(255, 255, 255, 0.2);
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-size: 0.95rem;
}

.feature-icon {
  font-size: 1.2rem;
}

.language-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: white;
}

.lang-btn {
  padding: 8px 16px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  background: transparent;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.lang-btn.active {
  background: white;
  color: #667eea;
  border-color: white;
}

.lang-btn:hover:not(.active) {
  border-color: white;
  background: rgba(255, 255, 255, 0.1);
}
</style>
