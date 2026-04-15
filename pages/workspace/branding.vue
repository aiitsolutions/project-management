<template>
  <div class="branding-canvas">
    <div class="branding-container">
      
      <!-- HEADER -->
      <header class="branding-header">
         <div class="platform-badge">Donezo Platform OS</div>
         <h1 class="platform-h1">Strict Visual Laws v1.3</h1>
         <p class="platform-p">Global component library and design tokens for high-density professional interfaces.</p>
      </header>

      <div class="branding-grid">
        
        <!-- TYPOGRAPHY SCALE -->
        <section class="branding-card">
           <div class="card-p-header">
              <h4 class="card-p-title">01 / The Inter Typography Standard</h4>
              <span class="card-p-sub">Strict specifications for scale and weight.</span>
           </div>
           
           <div class="spec-row">
              <label class="platform-label">Headings (H1)</label>
              <h1 class="demo-h1">Strategic Project Growth</h1>
              <code>font-size: 1.5rem; font-weight: 700; color: #111827; letter-spacing: -0.025em;</code>
           </div>

           <div class="spec-row mt-4">
              <label class="platform-label">Field Labels & Metadata</label>
              <label class="demo-label">ITEM TYPE / ASSOCIATED SPRINT / PRIORITY</label>
              <code>font-size: 0.75rem; font-weight: 600; color: #6B7280; uppercase; spacing: 0.05em;</code>
           </div>

           <div class="spec-row mt-4">
              <label class="platform-label">General Paragraphs (P)</label>
              <p class="demo-p">Define core requirements, set priorities, and assign team members to ensure optimal task velocity and output.</p>
              <code>font-size: 0.9rem; color: #6B7280;</code>
           </div>
        </section>

        <!-- SIGNATURE HERO INPUT -->
        <section class="branding-card">
           <div class="card-p-header">
              <h4 class="card-p-title">02 / Signature Hero Input Style</h4>
              <span class="card-p-sub">The borderless flagship input for major entities.</span>
           </div>
           
           <div class="hero-demo-box">
              <label class="platform-label">ITEM NAME</label>
              <input type="text" class="donezo-hero-input" placeholder="e.g. Implement real-time notifications" />
              <div class="spec-stack mt-4">
                 <code>border: none; border-bottom: 2px solid #F3F4F6;</code><br/>
                 <code>font-size: 1.75rem; font-weight: 600; color: #111827;</code><br/>
                 <code>Focus State: #10B981 (Emerald)</code>
              </div>
           </div>
        </section>

        <!-- INTERACTIVE ATOMS -->
        <section class="branding-card">
           <div class="card-p-header">
              <h4 class="card-p-title">03 / Interactive Atomic Elements</h4>
              <span class="card-p-sub">Buttons, Tabs, and Selection Triggers.</span>
           </div>
           
           <div class="atom-stack">
              <div class="atom-item">
                 <label class="platform-label">Primary Action (.btn-primary-thematic)</label>
                 <button class="btn-primary-thematic">Save Global Settings</button>
                 <code>Background #111827 / 12px Radius / 0.9rem weight-600</code>
              </div>

              <div class="atom-item mt-4">
                 <label class="platform-label">Selection Trigger (.custom-select-trigger)</label>
                 <div class="custom-select-trigger-demo">
                    <span>Project Backlog</span>
                 </div>
                 <code>1px solid #E5E7EB / 12px Radius / Min-H: 48px</code>
              </div>

              <div class="atom-item mt-4">
                 <label class="platform-label">Navigation Tabs (.view-tab-btn)</label>
                 <nav class="demo-tabs-row">
                    <button class="view-tab-btn active">
                       Primary Details
                       <span class="active-bar"></span>
                    </button>
                    <button class="view-tab-btn">Resource Allocation</button>
                 </nav>
                 <code>0.95rem Font / 2px #10B981 Active Bar</code>
              </div>
           </div>
        </section>

        <!-- LAYOUT & CARDS -->
        <section class="branding-card">
           <div class="card-p-header">
              <h4 class="card-p-title">04 / Layout & Card Architecture</h4>
              <span class="card-p-sub">Definition of depth, borders, and backgrounds.</span>
           </div>
           
           <div class="dna-demo-stack">
              <div class="dna-item">
                 <label class="platform-label">Platform Card Architecture</label>
                 <div class="mini-card-preview">
                    <h5 style="margin:0; font-size: 1.1rem; color: #111827; font-weight: 700;">Task Summary</h5>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.85rem; color: #6B7280; font-weight: 500;">Cards use a high-density, minimal shadow model.</p>
                 </div>
                 <div class="spec-stack mt-2">
                    <code>Background: #FFFFFF / Border: 1px solid #F3F4F6</code><br/>
                    <code>Radius: 16px / Shadow: 0 4px 15px rgba(0,0,0,0.02)</code>
                 </div>
              </div>

              <div class="dna-item mt-4">
                 <label class="platform-label">Global Surface Colors</label>
                 <div class="color-ribbon">
                    <div class="color-chip" style="background: #111827;"><span>#111827</span></div>
                    <div class="color-chip" style="background: #10B981;"><span>#10B981</span></div>
                    <div class="color-chip" style="background: #F9FAFB; border: 1px solid #E5E7EB;"><span>#F9FAFB</span></div>
                    <div class="color-chip" style="background: #F3F4F6;"><span>#F3F4F6</span></div>
                 </div>
              </div>
           </div>
        </section>

      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: false })
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.branding-canvas {
  background: #F9FAFB;
  min-height: 100vh;
  font-family: var(--font-family) !important;
  color: #111827;
  padding: 5rem 2.5rem;
}

.branding-container { max-width: 1200px; margin: 0 auto; }

.branding-header { border-bottom: 2px solid #F3F4F6; padding-bottom: 3.5rem; margin-bottom: 5rem; }
.platform-badge { display: inline-block; background: #111827; color: white; padding: 0.5rem 1rem; border-radius: 10px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; margin-bottom: 1.5rem; letter-spacing: 0.1em; }
.platform-h1 { font-size: 1.5rem; font-weight: 700; color: #111827; letter-spacing: -0.025em; margin: 0 0 0.5rem 0; }
.platform-p { font-size: 0.9rem; color: #6B7280; font-weight: 500; margin: 0; }

.branding-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; }

/* THE DONEZO CARD (.branding-card) */
.branding-card {
  background: #FFFFFF;
  border: 1px solid #F3F4F6;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.02);
}

.card-p-header { margin-bottom: 2.5rem; }
.card-p-title { font-size: 1.25rem; font-weight: 700; color: #111827; margin: 0; letter-spacing: -0.02em; }
.card-p-sub { font-size: 0.85rem; color: #9CA3AF; font-weight: 500; }

/* 1. TYPOGRAPHY */
.platform-label { font-size: 0.75rem; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 0.75rem; }
.demo-h1 { font-size: 1.5rem; font-weight: 700; color: #111827; letter-spacing: -0.025em; margin: 0 0 0.5rem 0; }
.demo-label { font-size: 0.75rem; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 0.5rem; }
.demo-p { font-size: 0.9rem; color: #6B7280; line-height: 1.6; margin: 0 0 0.75rem 0; font-weight: 500; }

code { font-family: monospace; font-size: 0.75rem; color: #9CA3AF; background: #F3F4F6; padding: 0.35rem 0.6rem; border-radius: 6px; display: inline-block; white-space: nowrap; }

/* 2. HERO INPUT */
.donezo-hero-input {
  width: 100%; border: none; border-bottom: 2px solid #F3F4F6;
  font-size: 1.75rem; font-weight: 600; color: #111827;
  outline: none; transition: 0.2s; padding-bottom: 1rem; background: transparent;
}
.donezo-hero-input:focus { border-color: #10B981; }

/* 3. ATOMICS */
.btn-primary-thematic {
  background: #111827; color: white; border: none;
  padding: 0.85rem 1.75rem; border-radius: 12px;
  font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: 0.2s;
}
.btn-primary-thematic:hover { background: #1F2937; transform: translateY(-1px); }

.custom-select-trigger-demo {
  border: 1px solid #E5E7EB; border-radius: 12px; min-height: 48px;
  background: white; padding: 0 1.25rem; display: flex; align-items: center;
  font-size: 0.95rem; color: #111827; font-weight: 500;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 1.25rem center; background-size: 16px;
}

.demo-tabs-row { display: flex; gap: 2rem; border-bottom: 2px solid #F3F4F6; padding-bottom: 0; }
.view-tab-btn {
  background: transparent; border: none; padding: 1rem 0.25rem;
  font-size: 0.95rem; font-weight: 500; color: #6B7280;
  cursor: pointer; position: relative;
}
.view-tab-btn.active { color: #111827; font-weight: 600; }
.active-bar {
  position: absolute; bottom: -2px; left: 0; width: 100%; height: 2px;
  background: #10B981; border-radius: 99px;
}

/* 4. LAYOUT DNA */
.mini-card-preview { border: 1px solid #F3F4F6; border-radius: 12px; padding: 1.5rem; background: #FAFBFC; box-shadow: 0 2px 8px rgba(0,0,0,0.01); }
.color-ribbon { display: flex; gap: 0.75rem; }
.color-chip { width: 100px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.color-chip span { font-size: 0.7rem; font-weight: 800; mix-blend-mode: difference; color: white; }

.mt-4 { margin-top: 2rem; }
.mt-2 { margin-top: 0.75rem; }
</style>
