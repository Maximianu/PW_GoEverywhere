<template>
  <div style="background: #05070a; position: relative; min-height: 100vh; color: white; font-family: 'Inter', sans-serif;">
    <!-- Hero Section -->
    <div style="position: relative; height: 50rem; overflow: hidden;">
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center;">
        <video autoplay muted loop style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; opacity: 0.7; object-fit: cover; width: 100%; height: 100%;">
          <source src="../assets/planetaCinematico.mp4" type="video/mp4" />
        </video>
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(to bottom, rgba(5,7,10,0.6), rgba(5,7,10,0.2) 78.846%, rgba(5,7,10,0.9) 92%, #05070a 100%);"></div>
        <div style="position: absolute; left: 0; right: 0; bottom: 0; height: 12rem; background: linear-gradient(to bottom, rgba(5,7,10,0), #05070a 100%);"></div>
        <!-- Background image using imageHome.png -->
      </div>
      <div style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 52.7888rem; height: 29.875rem;">
        <div style="position: absolute; left: 1rem; top: 0; width: 50.7888rem; display: flex; align-items: center;">
          <div style="font-family: 'Orbitron', sans-serif; font-weight: bold; font-size: 6rem; line-height: 6rem; text-align: center; background: linear-gradient(to right, white, #00f2ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: transparent; letter-spacing: -0.15rem;">
            <p style="margin: 0;">GoEverywhere</p>
            <p style="margin: 0;">Beyond the</p>
            <p style="margin: 0;">Horizon</p>
          </div>
        </div>
        <div style="position: absolute; left: 5.3944rem; top: 19.5rem; max-width: 42rem; width: 42rem; display: flex; align-items: center; box-shadow: 0 0.25rem 0.1875rem 0 rgba(0,0,0,0.1), 0 0.625rem 0.5rem 0 rgba(0,0,0,0.04);">
          <div style="font-family: 'Inter', sans-serif; font-weight: 300; font-size: 1.5rem; line-height: 2rem; text-align: center; color: rgba(255,255,255,0.9);">
          </div>
        </div>
        <div style="position: absolute; left: 1rem; top: 25rem; width: 50.7888rem; display: flex; gap: 0.9994rem; align-items: center; justify-content: center; padding-top: 1rem;">
          <router-link to="/book" style="background: #00f2ff; display: flex; align-items: center; justify-content: center; padding: 1.0938rem 2.5rem 1.0312rem; border-radius: 624.9375rem;">
            <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 1.125rem; line-height: 1.75rem; text-align: center; color: #05070a;">
              Reserve Sua Jornada
            </div>
          </router-link>
          <router-link to="/missions" style="backdrop-filter: blur(0.375rem); background: rgba(255,255,255,0.03); border: 0.0625rem solid rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center; padding: 1.0625rem 2.5625rem; border-radius: 624.9375rem;">
            <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 1.125rem; line-height: 1.75rem; text-align: center; color: white;">
              Ver Missões Ativas
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <!-- About Us Section -->
    <div style="position: relative; background: #05070a; display: flex; align-items: center; padding: 6rem 2rem;">
      <div style="max-width: 80rem; width: 100%; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 4rem;">
        <div style="display: flex; flex-direction: column; gap: 1.5rem; align-items: flex-start;">
          <div style="font-family: 'Orbitron', sans-serif; font-weight: bold; font-size: 2.25rem; line-height: 2.5rem; color: #00f2ff;">
            Inovação sem Fronteiras
          </div>
          <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 1.125rem; line-height: 1.8281rem; color: rgba(255,255,255,0.7);">
            <p style="margin: 0;">A GoEverywhere evoluiu de uma líder em logística terrestre para a</p>
            <p style="margin: 0;">vanguarda da exploração espacial. Nossa missão é democratizar o</p>
            <p style="margin: 0;">acesso ao cosmos, integrando turismo de luxo com soluções de</p>
            <p style="margin: 0;">logística orbital de alta confiabilidade.</p>
          </div>
          <div style="display: flex; gap: 1rem; align-items: flex-start;">
            <div style="background: rgba(0,242,255,0.1); display: flex; align-items: flex-start; padding: 0.5rem; border-radius: 0.5rem;">
              <img src="../assets/Escudo.svg" alt="" style="width: 1.5rem; height: 1.5rem;" />
            </div>
            <div>
              <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 1rem; color: white;">Tecnologia de Ponta</div>
              <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 0.875rem; color: rgba(255,255,255,0.6);">Propulsão sustentável e naves reutilizáveis.</div>
            </div>
          </div>
        </div>
        <div style="display: flex; align-items: center; justify-content: center;">
          <img src="../assets/galaxia.png" alt="" style="width: 100%; max-width: 31.25rem;" />
        </div>
      </div>
    </div>

    <!-- Destinations Section -->
    <div style="position: relative; background: rgba(10,25,47,0.3); display: flex; align-items: flex-start; padding: 6rem 2rem;">
      <div style="max-width: 80rem; width: 100%; margin: 0 auto; display: flex; flex-direction: column; gap: 4rem; align-items: flex-start;">
        <div style="display: flex; flex-direction: column; gap: 1rem; align-items: center; width: 100%;">
          <div style="font-family: 'Orbitron', sans-serif; font-weight: bold; font-size: 2.25rem; line-height: 2.5rem; text-align: center; color: white;">
            Escolha Seu Destino
          </div>
          <div style="background: #00f2ff; height: 0.25rem; width: 5rem;"></div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; width: 100%;">
          <!-- Card 1: Earth Orbit -->
          <div style="backdrop-filter: blur(0.375rem); background: rgba(255,255,255,0.03); border: 0.0625rem solid rgba(255,255,255,0.1); border-radius: 1.5rem; overflow: hidden; display: flex; flex-direction: column;">
            <div style="height: 16rem; position: relative;">
              <img src="../assets/satelite.png" alt="" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
            <div style="padding: 2rem; display: flex; flex-direction: column; gap: 0.75rem;">
              <div style="font-family: 'Orbitron', sans-serif; font-weight: bold; font-size: 1.5rem; line-height: 2rem; color: white;">
                Órbita Terrestre
              </div>
              <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 1rem; line-height: 1.5rem; color: rgba(255,255,255,0.6);">
                <p style="margin: 0;">Sinta a gravidade zero e contemple a</p>
                <p style="margin: 0;">curvatura da Terra em nossa estação</p>
                <p style="margin: 0;">panorâmica.</p>
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.4688rem; padding-top: 0.75rem; padding-bottom: 1.25rem;">
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                  <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 0.875rem; color: rgba(255,255,255,0.4);">•</div>
                  <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 0.875rem; color: rgba(255,255,255,0.4);">Estadia de 48 horas</div>
                </div>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                  <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 0.875rem; color: rgba(255,255,255,0.4);">•</div>
                  <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 0.875rem; color: rgba(255,255,255,0.4);">Vista de 360 graus</div>
                </div>
              </div>
              <router-link to="/book" style="border: 0.0625rem solid rgba(0,242,255,0.3); display: flex; align-items: center; justify-content: center; padding: 0.8125rem; border-radius: 0.5rem;">
                <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 1rem; line-height: 1.5rem; text-align: center; color: #00f2ff;">
                  Ver Detalhes
                </div>
              </router-link>
            </div>
          </div>

          <!-- Card 2: Lunar Base -->
          <div style="backdrop-filter: blur(0.375rem); background: rgba(255,255,255,0.03); border: 0.0625rem solid rgba(255,255,255,0.1); border-radius: 1.5rem; overflow: hidden; display: flex; flex-direction: column;">
            <div style="height: 16rem; position: relative;">
              <img src="../assets/Lunarbase.png" alt="" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
            <div style="padding: 2rem; display: flex; flex-direction: column; gap: 0.75rem;">
              <div style="font-family: 'Orbitron', sans-serif; font-weight: bold; font-size: 1.5rem; line-height: 2rem; color: white;">
                Base Lunar
              </div>
              <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 1rem; line-height: 1.5rem; color: rgba(255,255,255,0.6);">
                <p style="margin: 0;">Pise na superfície prateada e explore as</p>
                <p style="margin: 0;">colônias subterrâneas de Tycho.</p>
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.4688rem; padding-top: 0.75rem; padding-bottom: 1.25rem;">
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                  <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 0.875rem; color: rgba(255,255,255,0.4);">•</div>
                  <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 0.875rem; color: rgba(255,255,255,0.4);">Expedição Geológica</div>
                </div>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                  <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 0.875rem; color: rgba(255,255,255,0.4);">•</div>
                  <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 0.875rem; color: rgba(255,255,255,0.4);">Domo Biosférico</div>
                </div>
              </div>
              <router-link to="/book" style="border: 0.0625rem solid rgba(0,242,255,0.3); display: flex; align-items: center; justify-content: center; padding: 0.8125rem; border-radius: 0.5rem;">
                <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 1rem; line-height: 1.5rem; text-align: center; color: #00f2ff;">
                  Ver Detalhes
                </div>
              </router-link>
            </div>
          </div>

          <!-- Card 3: Deep Space -->
          <div style="backdrop-filter: blur(0.375rem); background: rgba(255,255,255,0.03); border: 0.0625rem solid rgba(255,255,255,0.1); border-radius: 1.5rem; overflow: hidden; display: flex; flex-direction: column;">
            <div style="height: 16rem; position: relative;">
              <img src="../assets/SOL.png" alt="" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
            <div style="padding: 2rem; display: flex; flex-direction: column; gap: 0.75rem;">
              <div style="font-family: 'Orbitron', sans-serif; font-weight: bold; font-size: 1.5rem; line-height: 2rem; color: white;">
                Marte Primordial
              </div>
              <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 1rem; line-height: 1.5rem; color: rgba(255,255,255,0.6);">
                <p style="margin: 0;">O novo lar da humanidade. Missões tripuladas de longo curso para os desertos vermelhos e os desfiladeiros colossais de Ares.</p>
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.4688rem; padding-top: 0.75rem; padding-bottom: 1.25rem;">
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                  <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 0.875rem; color: rgba(255,255,255,0.4);">•</div>
                  <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 0.875rem; color: rgba(255,255,255,0.4);">Terraformação Atmosférica</div>
                </div>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                  <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 0.875rem; color: rgba(255,255,255,0.4);">•</div>
                  <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 0.875rem; color: rgba(255,255,255,0.4);">Postos Avançados em Phobos</div>
                </div>
              </div>
              <router-link to="/book" style="border: 0.0625rem solid rgba(0,242,255,0.3); display: flex; align-items: center; justify-content: center; padding: 0.8125rem; border-radius: 0.5rem;">
                <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 1rem; line-height: 1.5rem; text-align: center; color: #00f2ff;">
                  Ver Detalhes
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div style="position: relative; background: #05070a; border-top: 0.0625rem solid rgba(255,255,255,0.05); border-bottom: 0.0625rem solid rgba(255,255,255,0.05); padding: 5.0625rem 2rem;">
      <div style="max-width: 80rem; width: 100%; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem;">
        <div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: center;">
          <div style="font-family: 'Orbitron', sans-serif; font-weight: bold; font-size: 3rem; line-height: 3rem; text-align: center; color: #00f2ff;">
            500+
          </div>
          <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 0.75rem; line-height: 1rem; text-align: center; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.075rem;">
            Missões Completas
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: center;">
          <div style="font-family: 'Orbitron', sans-serif; font-weight: bold; font-size: 3rem; line-height: 3rem; text-align: center; color: #00f2ff;">
            12
          </div>
          <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 0.75rem; line-height: 1rem; text-align: center; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.075rem;">
            Naves Ativas
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: center;">
          <div style="font-family: 'Orbitron', sans-serif; font-weight: bold; font-size: 3rem; line-height: 3rem; text-align: center; color: #00f2ff;">
            98%
          </div>
          <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 0.75rem; line-height: 1rem; text-align: center; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.075rem;">
            Sucesso em Lançamentos
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: center;">
          <div style="font-family: 'Orbitron', sans-serif; font-weight: bold; font-size: 3rem; line-height: 3rem; text-align: center; color: #00f2ff;">
            4.9/5
          </div>
          <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 0.75rem; line-height: 1rem; text-align: center; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.075rem;">
            Satisfação do Cliente
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="position: relative; background: rgba(10,25,47,0.5); border-top: 0.0625rem solid rgba(255,255,255,0.1); padding: 2.5rem 2rem 5.0625rem;">
      <div style="max-width: 80rem; width: 100%; margin: 0 auto; display: flex; flex-direction: column; gap: 4rem;">
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 3rem;">
          <div style="display: flex; flex-direction: column; gap: 0.9219rem; align-items: flex-start;">
            <div style="font-family: 'Orbitron', sans-serif; font-weight: bold; font-size: 1.5rem; line-height: 2rem; color: #00f2ff;">
              GoEverywhere
            </div>
            <div style="max-width: 20rem; width: 20rem; display: flex; flex-direction: column; align-items: flex-start;">
              <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 0.875rem; line-height: 1.4219rem; color: rgba(255,255,255,0.5);">
                <p style="margin: 0;">Liderando o caminho para um futuro</p>
                <p style="margin: 0;">multiplanetário. Transformando o céu de um</p>
                <p style="margin: 0;">limite em um destino.</p>
              </div>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 1.5rem; align-items: flex-start;">
            <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 0.75rem; line-height: 1rem; text-transform: uppercase; letter-spacing: 0.075rem; color: white;">
              Explorar
            </div>
            <div style="display: flex; flex-direction: column; gap: 1rem; align-items: flex-start;">
              <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 0.875rem; line-height: 1.25rem; color: rgba(255,255,255,0.5);">
                Destinos
              </div>
              <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 0.875rem; line-height: 1.25rem; color: rgba(255,255,255,0.5);">
                Frota
              </div>
              <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 0.875rem; line-height: 1.25rem; color: rgba(255,255,255,0.5);">
                Logística Orbital
              </div>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 1.5rem; align-items: flex-start;">
            <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 0.75rem; line-height: 1rem; text-transform: uppercase; letter-spacing: 0.075rem; color: white;">
              Contato
            </div>
            <div style="display: flex; flex-direction: column; gap: 1rem; align-items: flex-start;">
              <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 0.875rem; line-height: 1.25rem; color: rgba(255,255,255,0.5);">
                Terminal de Apoio, Kourou
              </div>
              <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 0.875rem; line-height: 1.25rem; color: rgba(255,255,255,0.5);">
                contact@goeverywhere.space
              </div>
              <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 0.875rem; line-height: 1.25rem; color: rgba(255,255,255,0.5);">
                +55 (00) 9000-0000
              </div>
            </div>
          </div>
        </div>
        <div style="border-top: 0.0625rem solid rgba(255,255,255,0.05); padding-top: 2.5625rem; display: flex; align-items: center; justify-content: space-between;">
          <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 0.75rem; line-height: 1rem; color: rgba(255,255,255,0.3);">
            © 2026 GoEverywhere: Space Edition. Todos os direitos reservados.
          </div>
          <div style="display: flex; gap: 1.5rem; align-items: flex-start;">
            <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 0.75rem; line-height: 1rem; color: rgba(255,255,255,0.3);">
              Privacidade
            </div>
            <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 0.75rem; line-height: 1rem; color: rgba(255,255,255,0.3);">
              Termos de Uso
            </div>
            <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 0.75rem; line-height: 1rem; color: rgba(255,255,255,0.3);">
              Protocolos de Segurança
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Galaxia from '../assets/galaxia.png'
export default {
  name: 'HomeView'
}
</script>

<style scoped>
/* Add Orbitron font if not available */
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');
</style>
