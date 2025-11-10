const testData = {
  userId: "cmht8lo200000gdyksffojbt0",
  projectId: "test-project-123",
  basicInfo: {
    siteName: "Teste Site",
    slogan: "Um site de teste",
    siteType: "servico",
    niche: "tecnologia"
  },
  visualIdentity: {
    logoUrl: null,
    primaryColor: "#FF0000",
    secondaryColor: "#00FF00",
    style: "moderno",
    referenceUrls: []
  },
  content: {
    description: "Site para testes",
    targetAudience: "Desenvolvedores",
    products: ["Serviço 1"],
    cta: "Teste Agora",
    sections: ["hero", "beneficios"]
  },
  contact: {
    email: "test@test.com",
    phone: "",
    address: "",
    socialMedia: {
      instagram: "",
      facebook: "",
      linkedin: "",
      twitter: "",
      whatsapp: ""
    }
  },
  additionalResources: {
    images: [],
    customTexts: "Texto personalizado",
    features: ["lead-form"]
  },
  timestamp: new Date().toISOString()
}

console.log('Dados de teste para criação de projeto:')
console.log(JSON.stringify(testData, null, 2))

// Fazer requisição para API
fetch('http://localhost:3000/api/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(response => response.json())
.then(result => {
  console.log('Resultado da API:', result)
})
.catch(error => {
  console.error('Erro:', error)
})