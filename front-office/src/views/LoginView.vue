<template>
  <div class="side-layout">
    <SidePanel />
    <main class="page-shell" style="padding: 0;">
      <section class="panel" style="max-width: 720px; margin: 0 auto;">
        <div class="section-header">
          <div>
            <p class="small-note">Login</p>
            <h1 class="headline" style="font-size: 2.85rem;">Verificação de Identidade</h1>
          </div>
        </div>

        <p class="subtitle">Ligação segura à rede orbital. Por favor, introduza as suas credenciais de voo.</p>

        <div class="input-group">
          <label>
            Email
            <input type="email" placeholder="commander@orbital.link" />
          </label>
          <label>
            Password
            <input type="password" placeholder="••••••••••••" />
          </label>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin: 24px 0;">
          <a href="#" class="btn btn-secondary">Esqueci a Password</a>
          <button class="btn btn-primary">Iniciar Login</button>
        </div>

        <p class="subtitle" style="margin-top: 18px;">Novo Explorador? <a href="#" style="color: var(--primary);">Pedir Acesso</a></p>
      </section>
    </main>
  </div>
</template>

<script setup>
import SidePanel from '../components/SidePanel.vue'
</script>
