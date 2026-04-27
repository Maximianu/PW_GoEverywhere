<template>
  <div style="background: #05070a; position: relative; min-height: 100vh; color: white; font-family: 'Inter', sans-serif;">
    <!-- Hero Section -->
    <div style="position: absolute; top: 0; left: 0; right: 0; height: 4014px; overflow: hidden;">
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 2852px; display: flex; align-items: center; justify-content: center;">
        <img src="https://www.figma.com/api/mcp/asset/a0655d98-5fa9-4db9-9d98-961f93d7c248" alt="" style="position: absolute; top: 0; left: 0; right: 0; bottom: 12px; opacity: 0.7; object-fit: cover; width: 100%; height: 100%;" />
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(to bottom, rgba(5,7,10,0.6), rgba(5,7,10,0.2) 78.846%, rgba(5,7,10,0));"></div>
      </div>
      <div style="position: absolute; left: 218px; top: 385px; width: 844.62px; height: 478px;">
        <div style="position: absolute; left: 16px; top: 0; width: 812.62px; display: flex; align-items: center; box-shadow: 0px 25px 25px 0px rgba(0,0,0,0.15);">
          <div style="font-family: 'Orbitron', sans-serif; font-weight: bold; font-size: 96px; line-height: 96px; text-align: center; background: linear-gradient(to right, white, #00f2ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: transparent; letter-spacing: -2.4px;">
            <p style="margin: 0;">GoEverywhere</p>
            <p style="margin: 0;">Beyond the</p>
            <p style="margin: 0;">Horizon</p>
          </div>
        </div>
        <div style="position: absolute; left: 86.31px; top: 312px; max-width: 672px; width: 672px; display: flex; align-items: center; box-shadow: 0px 4px 3px 0px rgba(0,0,0,0.1), 0px 10px 8px 0px rgba(0,0,0,0.04);">
          <div style="font-family: 'Inter', sans-serif; font-weight: 300; font-size: 24px; line-height: 32px; text-align: center; color: rgba(255,255,255,0.9);">
            <p style="margin: 0;">Pioneirismo no futuro das experiências espaciais e logística</p>
            <p style="margin: 0;">orbital avançada.</p>
          </div>
        </div>
        <div style="position: absolute; left: 16px; top: 400px; width: 812.62px; display: flex; gap: 15.99px; align-items: center; justify-content: center; padding-top: 16px;">
          <router-link to="/book" style="background: #00f2ff; display: flex; align-items: center; justify-content: center; padding: 17.5px 40px 16.5px; border-radius: 9999px;">
            <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 18px; line-height: 28px; text-align: center; color: #05070a;">
              Reserve Sua Jornada
            </div>
          </router-link>
          <router-link to="/missions" style="backdrop-filter: blur(6px); background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center; padding: 17px 41px; border-radius: 9999px;">
            <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 18px; line-height: 28px; text-align: center; color: white;">
              Ver Missões Ativas
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <!-- About Us Section -->
    <div style="position: absolute; top: 1162px; left: 0; right: 0; background: #05070a; display: flex; align-items: center; padding: 96px 32px;">
      <div style="max-width: 1280px; width: 100%; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 64px;">
        <div style="display: flex; flex-direction: column; gap: 24px; align-items: flex-start;">
          <div style="font-family: 'Orbitron', sans-serif; font-weight: bold; font-size: 36px; line-height: 40px; color: #00f2ff;">
            Inovação sem Fronteiras
          </div>
          <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 18px; line-height: 29.25px; color: rgba(255,255,255,0.7);">
            <p style="margin: 0;">A GoEverywhere evoluiu de uma líder em logística terrestre para a</p>
            <p style="margin: 0;">vanguarda da exploração espacial. Nossa missão é democratizar o</p>
            <p style="margin: 0;">acesso ao cosmos, integrando turismo de luxo com soluções de</p>
            <p style="margin: 0;">logística orbital de alta confiabilidade.</p>
          </div>
          <div style="display: flex; gap: 16px; align-items: flex-start;">
            <div style="background: rgba(0,242,255,0.1); display: flex; align-items: flex-start; padding: 8px; border-radius: 8px;">
              <img src="https://www.figma.com/api/mcp/asset/83b7028c-68c0-42ec-820b-539a3d15e1b6" alt="" style="width: 24px; height: 24px;" />
            </div>
            <div>
              <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 16px; color: white;">Tecnologia de Ponta</div>
              <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 14px; color: rgba(255,255,255,0.6);">Propulsão sustentável e naves reutilizáveis.</div>
            </div>
          </div>
        </div>
        <div style="display: flex; align-items: center; justify-content: center;">
          <img src="https://www.figma.com/api/mcp/asset/2fdc9e7c-6e48-4016-9c6a-3910bdcc00a9" alt="" style="width: 100%; max-width: 500px;" />
        </div>
      </div>
    </div>

    <!-- Destinations Section -->
    <div style="position: absolute; top: 1846px; left: 0; right: 0; background: rgba(10,25,47,0.3); display: flex; align-items: flex-start; padding: 96px 32px;">
      <div style="max-width: 1280px; width: 100%; margin: 0 auto; display: flex; flex-direction: column; gap: 64px; align-items: flex-start;">
        <div style="display: flex; flex-direction: column; gap: 16px; align-items: center; width: 100%;">
          <div style="font-family: 'Orbitron', sans-serif; font-weight: bold; font-size: 36px; line-height: 40px; text-align: center; color: white;">
            Escolha Seu Destino
          </div>
          <div style="background: #00f2ff; height: 4px; width: 80px;"></div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; width: 100%;">
          <!-- Card 1: Earth Orbit -->
          <div style="backdrop-filter: blur(6px); background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; overflow: hidden; display: flex; flex-direction: column;">
            <div style="height: 256px; position: relative;">
              <img src="https://www.figma.com/api/mcp/asset/28a03bf0-9627-422d-bacc-9b519e092fa1" alt="" style="width: 100%; height: 100%; object-fit: cover;" />
              <img src="https://www.figma.com/api/mcp/asset/5357f203-3151-41f0-a767-582cea075983" alt="" style="position: absolute; top: 0; left: 0; width: 382px; height: 256px;" />
            </div>
            <div style="padding: 32px; display: flex; flex-direction: column; gap: 12px;">
              <div style="font-family: 'Orbitron', sans-serif; font-weight: bold; font-size: 24px; line-height: 32px; color: white;">
                Órbita Terrestre
              </div>
              <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 16px; line-height: 24px; color: rgba(255,255,255,0.6);">
                <p style="margin: 0;">Sinta a gravidade zero e contemple a</p>
                <p style="margin: 0;">curvatura da Terra em nossa estação</p>
                <p style="margin: 0;">panorâmica.</p>
              </div>
              <div style="display: flex; flex-direction: column; gap: 7.5px; padding-top: 12px; padding-bottom: 20px;">
                <div style="display: flex; gap: 8px; align-items: center;">
                  <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 14px; color: rgba(255,255,255,0.4);">•</div>
                  <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 14px; color: rgba(255,255,255,0.4);">Estadia de 48 horas</div>
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                  <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 14px; color: rgba(255,255,255,0.4);">•</div>
                  <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 14px; color: rgba(255,255,255,0.4);">Vista de 360 graus</div>
                </div>
              </div>
              <router-link to="/book" style="border: 1px solid rgba(0,242,255,0.3); display: flex; align-items: center; justify-content: center; padding: 13px; border-radius: 8px;">
                <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 16px; line-height: 24px; text-align: center; color: #00f2ff;">
                  Ver Detalhes
                </div>
              </router-link>
            </div>
          </div>

          <!-- Card 2: Lunar Base -->
          <div style="backdrop-filter: blur(6px); background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; overflow: hidden; display: flex; flex-direction: column;">
            <div style="height: 256px; position: relative;">
              <img src="https://www.figma.com/api/mcp/asset/a4a78439-dd36-4332-9bc2-85c8d3775007" alt="" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
            <div style="padding: 32px; display: flex; flex-direction: column; gap: 12px;">
              <div style="font-family: 'Orbitron', sans-serif; font-weight: bold; font-size: 24px; line-height: 32px; color: white;">
                Base Lunar
              </div>
              <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 16px; line-height: 24px; color: rgba(255,255,255,0.6);">
                <p style="margin: 0;">Pise na superfície prateada e explore as</p>
                <p style="margin: 0;">colônias subterrâneas de Tycho.</p>
              </div>
              <div style="display: flex; flex-direction: column; gap: 7.5px; padding-top: 12px; padding-bottom: 20px;">
                <div style="display: flex; gap: 8px; align-items: center;">
                  <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 14px; color: rgba(255,255,255,0.4);">•</div>
                  <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 14px; color: rgba(255,255,255,0.4);">Expedição Geológica</div>
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                  <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 14px; color: rgba(255,255,255,0.4);">•</div>
                  <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 14px; color: rgba(255,255,255,0.4);">Domo Biosférico</div>
                </div>
              </div>
              <router-link to="/book" style="border: 1px solid rgba(0,242,255,0.3); display: flex; align-items: center; justify-content: center; padding: 13px; border-radius: 8px;">
                <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 16px; line-height: 24px; text-align: center; color: #00f2ff;">
                  Ver Detalhes
                </div>
              </router-link>
            </div>
          </div>

          <!-- Card 3: Deep Space -->
          <div style="backdrop-filter: blur(6px); background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; overflow: hidden; display: flex; flex-direction: column;">
            <div style="height: 256px; position: relative;">
              <img src="https://www.figma.com/api/mcp/asset/8fc4bda4-02eb-42af-9a01-f1ca63515cf5" alt="" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
            <div style="padding: 32px; display: flex; flex-direction: column; gap: 12px;">
              <div style="font-family: 'Orbitron', sans-serif; font-weight: bold; font-size: 24px; line-height: 32px; color: white;">
                Espaço Profundo
              </div>
              <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 16px; line-height: 24px; color: rgba(255,255,255,0.6);">
                <p style="margin: 0;">A última fronteira. Missões tripuladas</p>
                <p style="margin: 0;">para as areias de Marte e os anéis de</p>
                <p style="margin: 0;">Saturno.</p>
              </div>
              <div style="display: flex; flex-direction: column; gap: 7.5px; padding-top: 12px; padding-bottom: 20px;">
                <div style="display: flex; gap: 8px; align-items: center;">
                  <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 14px; color: rgba(255,255,255,0.4);">•</div>
                  <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 14px; color: rgba(255,255,255,0.4);">Viagem Criogênica</div>
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                  <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 14px; color: rgba(255,255,255,0.4);">•</div>
                  <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 14px; color: rgba(255,255,255,0.4);">Exploração de Titã</div>
                </div>
              </div>
              <router-link to="/book" style="border: 1px solid rgba(0,242,255,0.3); display: flex; align-items: center; justify-content: center; padding: 13px; border-radius: 8px;">
                <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 16px; line-height: 24px; text-align: center; color: #00f2ff;">
                  Ver Detalhes
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div style="position: absolute; top: 2633px; left: 0; right: 0; background: #05070a; border-top: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); padding: 81px 32px;">
      <div style="max-width: 1280px; width: 100%; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px;">
        <div style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
          <div style="font-family: 'Orbitron', sans-serif; font-weight: bold; font-size: 48px; line-height: 48px; text-align: center; color: #00f2ff;">
            500+
          </div>
          <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 12px; line-height: 16px; text-align: center; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1.2px;">
            Missões Completas
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
          <div style="font-family: 'Orbitron', sans-serif; font-weight: bold; font-size: 48px; line-height: 48px; text-align: center; color: #00f2ff;">
            12
          </div>
          <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 12px; line-height: 16px; text-align: center; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1.2px;">
            Naves Ativas
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
          <div style="font-family: 'Orbitron', sans-serif; font-weight: bold; font-size: 48px; line-height: 48px; text-align: center; color: #00f2ff;">
            98%
          </div>
          <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 12px; line-height: 16px; text-align: center; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1.2px;">
            Sucesso em Lançamentos
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
          <div style="font-family: 'Orbitron', sans-serif; font-weight: bold; font-size: 48px; line-height: 48px; text-align: center; color: #00f2ff;">
            4.9/5
          </div>
          <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 12px; line-height: 16px; text-align: center; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1.2px;">
            Satisfação do Cliente
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="position: absolute; top: 3640px; left: 0; right: 0; background: rgba(10,25,47,0.5); border-top: 1px solid rgba(255,255,255,0.1); padding: 40px 32px 81px;">
      <div style="max-width: 1280px; width: 100%; margin: 0 auto; display: flex; flex-direction: column; gap: 64px;">
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px;">
          <div style="display: flex; flex-direction: column; gap: 14.75px; align-items: flex-start;">
            <div style="font-family: 'Orbitron', sans-serif; font-weight: bold; font-size: 24px; line-height: 32px; color: #00f2ff;">
              GoEverywhere
            </div>
            <div style="max-width: 320px; width: 320px; display: flex; flex-direction: column; align-items: flex-start;">
              <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 14px; line-height: 22.75px; color: rgba(255,255,255,0.5);">
                <p style="margin: 0;">Liderando o caminho para um futuro</p>
                <p style="margin: 0;">multiplanetário. Transformando o céu de um</p>
                <p style="margin: 0;">limite em um destino.</p>
              </div>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 24px; align-items: flex-start;">
            <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 12px; line-height: 16px; text-transform: uppercase; letter-spacing: 1.2px; color: white;">
              Explorar
            </div>
            <div style="display: flex; flex-direction: column; gap: 16px; align-items: flex-start;">
              <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 14px; line-height: 20px; color: rgba(255,255,255,0.5);">
                Destinos
              </div>
              <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 14px; line-height: 20px; color: rgba(255,255,255,0.5);">
                Frota
              </div>
              <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 14px; line-height: 20px; color: rgba(255,255,255,0.5);">
                Logística Orbital
              </div>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 24px; align-items: flex-start;">
            <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 12px; line-height: 16px; text-transform: uppercase; letter-spacing: 1.2px; color: white;">
              Contato
            </div>
            <div style="display: flex; flex-direction: column; gap: 16px; align-items: flex-start;">
              <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 14px; line-height: 20px; color: rgba(255,255,255,0.5);">
                Terminal de Apoio, Kourou
              </div>
              <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 14px; line-height: 20px; color: rgba(255,255,255,0.5);">
                contact@goeverywhere.space
              </div>
              <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 14px; line-height: 20px; color: rgba(255,255,255,0.5);">
                +55 (00) 9000-0000
              </div>
            </div>
          </div>
        </div>
        <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 41px; display: flex; align-items: center; justify-content: space-between;">
          <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 12px; line-height: 16px; color: rgba(255,255,255,0.3);">
            © 2024 GoEverywhere: Space Edition. Todos os direitos reservados.
          </div>
          <div style="display: flex; gap: 24px; align-items: flex-start;">
            <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 12px; line-height: 16px; color: rgba(255,255,255,0.3);">
              Privacidade
            </div>
            <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 12px; line-height: 16px; color: rgba(255,255,255,0.3);">
              Termos de Uso
            </div>
            <div style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 12px; line-height: 16px; color: rgba(255,255,255,0.3);">
              Protocolos de Segurança
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>

<style scoped>
/* Add Orbitron font if not available */
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');
</style>
