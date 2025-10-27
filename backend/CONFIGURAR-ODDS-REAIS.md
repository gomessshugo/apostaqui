# 🎯 CONFIGURAR ODDS REAIS - The Odds API

## 📋 **PASSO A PASSO**

### **1. Criar Conta Gratuita**
1. Acesse: https://the-odds-api.com/
2. Clique em **"Get Free API Key"**
3. Preencha o formulário
4. **Gratuito**: 500 requests/mês
5. **Pago**: $10/mês para 10.000 requests

### **2. Configurar API Key**
```bash
# No arquivo .env
THE_ODDS_API_KEY=sua-chave-aqui
```

### **3. Testar API**
```bash
# Teste simples
curl "https://api.the-odds-api.com/v4/sports/soccer/odds/?apiKey=SUA_CHAVE&regions=us&markets=h2h"
```

## 🚀 **ENDPOINTS DISPONÍVEIS**

### **GET /odds-liga/:id**
- **Descrição**: Busca odds reais de uma liga
- **Exemplo**: `GET /odds-liga/4329` (Brasileirão)
- **Resposta**: Lista de jogos com odds 1x2, Over/Under, Handicap

### **GET /odds-jogo/:id**
- **Descrição**: Busca odds de um jogo específico
- **Exemplo**: `GET /odds-jogo/12345`
- **Resposta**: Odds detalhadas do jogo

### **GET /odds-ligas**
- **Descrição**: Lista ligas disponíveis para odds
- **Resposta**: Lista de ligas suportadas

## 📊 **TIPOS DE ODDS DISPONÍVEIS**

### **1. Match Winner (1x2)**
```json
{
  "h2h": [
    { "name": "Flamengo", "price": "1.85" },
    { "name": "Draw", "price": "3.20" },
    { "name": "Palmeiras", "price": "4.10" }
  ]
}
```

### **2. Over/Under (Totais)**
```json
{
  "totals": [
    { "name": "Over 2.5", "price": "1.90" },
    { "name": "Under 2.5", "price": "1.95" }
  ]
}
```

### **3. Handicap (Espalhamento)**
```json
{
  "spreads": [
    { "name": "Flamengo -1.5", "price": "2.10" },
    { "name": "Palmeiras +1.5", "price": "1.80" }
  ]
}
```

## 🌍 **LIGAS SUPORTADAS**

| Liga | ID | Código API |
|------|----|-----------| 
| 🇧🇷 Brasileirão | 4329 | `soccer_brazil_campeonato` |
| 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League | 4328 | `soccer_epl` |
| 🇩🇪 Bundesliga | 4331 | `soccer_germany_bundesliga` |
| 🇪🇸 La Liga | 4332 | `soccer_spain_la_liga` |
| 🇮🇹 Serie A | 4334 | `soccer_italy_serie_a` |
| 🇫🇷 Ligue 1 | 4344 | `soccer_france_ligue_one` |
| 🇵🇹 Primeira Liga | 4346 | `soccer_portugal_primeira_liga` |
| 🇳🇱 Eredivisie | 4337 | `soccer_netherlands_eredivisie` |
| 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Championship | 4336 | `soccer_efl_championship` |
| 🌍 World Cup | 4330 | `soccer_fifa_world_cup` |
| 🇪🇺 Euro | 4333 | `soccer_uefa_euro` |
| 🏆 Champions League | 4338 | `soccer_uefa_champions_league` |

## 💡 **VANTAGENS**

### **✅ GRATUITO**
- 500 requests/mês
- Dados em tempo real
- Todas as ligas principais

### **✅ PROFISSIONAL**
- Odds de casas de apostas reais
- Atualização em tempo real
- Múltiplos mercados

### **✅ CONFIÁVEL**
- API estável
- Documentação completa
- Suporte técnico

## 🔧 **IMPLEMENTAÇÃO NO FRONTEND**

### **1. Adicionar ao services/api.js**
```javascript
// Odds Service
export const oddsService = {
  getOddsLiga: async (ligaId) => {
    const response = await axios.get(`/odds-liga/${ligaId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  getOddsJogo: async (jogoId) => {
    const response = await axios.get(`/odds-jogo/${jogoId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
```

### **2. Usar nos Componentes**
```javascript
// Exemplo de uso
const [odds, setOdds] = useState([]);

useEffect(() => {
  const loadOdds = async () => {
    const response = await oddsService.getOddsLiga('4329');
    setOdds(response.jogos);
  };
  loadOdds();
}, []);
```

## 🎯 **PRÓXIMOS PASSOS**

1. **Configurar API Key** no `.env`
2. **Testar endpoints** com Postman/curl
3. **Integrar no frontend** para mostrar odds reais
4. **Adicionar filtros** por tipo de mercado
5. **Implementar cache** para otimizar requests

## 📞 **SUPORTE**

- **Documentação**: https://the-odds-api.com/liveapi/guides/v4/
- **Status**: https://the-odds-api.com/status/
- **Limites**: Monitorar uso no dashboard

---

**🎉 COM ISSO, VOCÊ TERÁ ODDS REAIS EM TEMPO REAL!**
