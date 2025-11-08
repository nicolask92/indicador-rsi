# Dashboard de Indicadores RSI

Dashboard interactivo para visualizar indicadores RSI (Relative Strength Index) de empresas que cotizan en Argentina y Estados Unidos.

## 🚀 Características

- **Visualización en tiempo real** de indicadores RSI
- **Sectores organizados** (Technology, Energy, Financial, etc.)
- **Empresas argentinas y estadounidenses** más importantes
- **Actualización automática** cada 10 minutos
- **Códigos de color** según nivel de RSI:
  - 🔴 Rojo (≥70): Sobrecomprado
  - 🟡 Amarillo (50-70): Neutral Alto
  - 🟢 Verde (30-50): Neutral
  - 🟢 Verde Oscuro (<30): Sobrevendido
- **Sistema de caché** para optimizar llamadas a APIs
- **Responsive design** adaptable a cualquier dispositivo

## 🛠️ Stack Tecnológico

- **Frontend & Backend**: Next.js 14 (App Router)
- **Estilos**: Tailwind CSS
- **Datos**: Yahoo Finance API (gratuita)
- **Lenguaje**: TypeScript
- **Containerización**: Docker

## 📦 Instalación Local

### Prerequisitos

- Node.js 20 o superior
- npm o yarn

### Pasos

1. **Clonar o navegar al repositorio**
```bash
cd /home/nicolask/Documentos/indicador-rsi
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

4. **Abrir en el navegador**
```
http://localhost:3000
```

## 🐳 Deployment con Docker

### Construcción de la imagen

```bash
docker build -t indicador-rsi .
```

### Ejecutar el contenedor

```bash
docker run -p 3000:3000 indicador-rsi
```

## ☁️ Deployment en Coolify (OVH VPS)

### Opción 1: Desde Git Repository

1. **Crear un nuevo proyecto en Coolify**
   - Ve a tu panel de Coolify
   - Clic en "New Resource" → "Application"
   - Conecta tu repositorio Git

2. **Configurar el proyecto**
   - Build Pack: `Dockerfile`
   - Puerto: `3000`
   - Dockerfile Path: `./Dockerfile`

3. **Deploy**
   - Coolify construirá y desplegará automáticamente la aplicación
   - Asignará un dominio o puedes configurar uno personalizado

### Opción 2: Deploy Manual con Docker

1. **Construir la imagen en tu VPS**
```bash
cd /home/nicolask/Documentos/indicador-rsi
docker build -t indicador-rsi:latest .
```

2. **Ejecutar con docker-compose (opcional)**

Crear un archivo `docker-compose.yml`:

```yaml
version: '3.8'

services:
  web:
    image: indicador-rsi:latest
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

3. **Levantar el servicio**
```bash
docker-compose up -d
```

## 📊 Funcionalidades

### Actualización de Datos

- **Automática**: Los datos se actualizan automáticamente cada 10 minutos
- **Manual**: Botón "Actualizar" para refrescar datos inmediatamente
- **Caché**: Sistema de caché interno de 10 minutos para optimizar rendimiento

### Mercados Incluidos

#### Estados Unidos
- ETFs principales (SPY, QQQ, DIA, etc.)
- Technology (AAPL, MSFT, GOOGL, NVDA, etc.)
- Energy (XOM, CVX, COP, etc.)
- Financial (JPM, BAC, GS, etc.)
- Y más sectores...

#### Argentina
- Energy (YPF, TGS, TGN, etc.)
- Financial (GGAL, BMA, BBAR, etc.)
- Utilities (EDN, PAMP, CEPU, etc.)
- Telecom & Tech (TECO, LOMA, MIRG, etc.)
- Consumer & Industrial (ALUA, TXAR, CRES, etc.)

## 🔧 Configuración Avanzada

### Modificar Período de Actualización

Editar `app/page.tsx`, línea del `setInterval`:

```typescript
// Cambiar de 10 minutos a X minutos
const interval = setInterval(fetchData, X * 60 * 1000);
```

### Modificar Período de Caché

Editar `lib/cache.ts`:

```typescript
// Cambiar de 600 segundos (10 min) a X segundos
const cache = new NodeCache({ stdTTL: X, checkperiod: 120 });
```

### Agregar/Modificar Empresas

Editar `lib/stocks.ts` para agregar o modificar empresas y sectores.

## 📈 Cálculo del RSI

El RSI (Relative Strength Index) se calcula usando el método de Wilder:

1. Se obtienen datos de los últimos 30 días
2. Se calcula el promedio de ganancias y pérdidas sobre 14 períodos
3. RS = Promedio de Ganancias / Promedio de Pérdidas
4. RSI = 100 - (100 / (1 + RS))

## ⚠️ Limitaciones

- **Yahoo Finance API**: Gratuita pero puede tener límites de rate limiting
- **Datos argentinos**: Algunos símbolos pueden no estar disponibles en Yahoo Finance
- **Actualización**: No es tiempo real, se actualiza cada 10 minutos

## 🐛 Troubleshooting

### Error: "No data available"
- Verificar que el símbolo existe en Yahoo Finance
- Algunos símbolos argentinos pueden no estar disponibles

### Puerto 3000 ocupado
```bash
# Cambiar el puerto en el Dockerfile o al ejecutar:
docker run -p 8080:3000 indicador-rsi
```

### Errores de build
```bash
# Limpiar caché de npm
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Contacto

Para consultas o sugerencias, por favor abre un issue en el repositorio.

---

**Desarrollado con ❤️ usando Next.js**

