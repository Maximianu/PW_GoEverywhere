<template>
  <div class="side-layout">
    <SidePanel />
    <main class="page-shell" style="padding: 0;">
      <section class="panel">
        <div class="section-header">
          <div>
            <p class="small-note">Escolha o seu kit</p>
            <h1 class="headline" style="font-size: 2.8rem;">Monte sua carga espacial</h1>
          </div>
        </div>

        <p class="subtitle">Selecione o equipamento ideal para sua missão.</p>

        <div class="grid grid-3" style="margin-top: 26px;">
          <div class="card">
            <div class="card-body" style="display:grid; gap: 20px;">
              <div class="card-header">
                <div>
                  <h3 class="card-title">Básico</h3>
                  <p class="card-text">Boa sorte.</p>
                </div>
              </div>
              <ul class="card-text" style="list-style:none; padding:0; margin:0; display:grid; gap:10px;">
                <li>• Ox-gem standard v2</li>
                <li>• Casco reforçado</li>
              </ul>
              <button class="btn btn-secondary">Selecionar</button>
            </div>
          </div>

          <div class="card" style="border-color: rgba(0, 242, 255, 0.2);">
            <div class="card-body" style="display:grid; gap:20px;">
              <div class="card-header">
                <div>
                  <h3 class="card-title">Normal</h3>
                  <p class="card-text">Performance estável e segura.</p>
                </div>
                <span class="badge">Recommended</span>
              </div>
              <ul class="card-text" style="list-style:none; padding:0; margin:0; display:grid; gap:10px;">
                <li>• AI-Augmented HUD</li>
                <li>• Kevlar-Mylar Hybrid</li>
                <li>• 24H Life Support</li>
              </ul>
              <button class="btn btn-primary">Selecionar</button>
            </div>
          </div>

          <div class="card">
            <div class="card-body" style="display:grid; gap:20px;">
              <div class="card-header">
                <div>
                  <h3 class="card-title">VIP</h3>
                  <p class="card-text">Conforto e segurança sem compromisso.</p>
                </div>
              </div>
              <ul class="card-text" style="list-style:none; padding:0; margin:0; display:grid; gap:10px;">
                <li>• Titanium exoskeleton</li>
                <li>• Neural link interface</li>
              </ul>
              <button class="btn btn-secondary">Selecionar</button>
            </div>
          </div>
        </div>

        <section class="panel ghost" style="margin-top: 30px;">
          <h3 class="card-title">Já tem equipamento?</h3>
          <p class="card-text">Traga o seu equipamento para uma inspeção e verificar se é adequado à viagem.</p>
          <button class="btn btn-secondary" style="margin-top: 18px;">Registar Equipamento</button>
        </section>

        <router-link to="/checkout" class="btn btn-primary" style="margin-top: 28px;">Pagamento →</router-link>
      </section>
    </main>
  </div>
</template>

<script setup>
import SidePanel from '../components/SidePanel.vue'
</script>
