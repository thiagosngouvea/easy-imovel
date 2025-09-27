# Easy Imóvel

Um aplicativo de gerenciamento imobiliário construído com Expo, Tamagui, Zustand e TypeScript.

## 🚀 Tecnologias

- **Expo Router** - Navegação baseada em arquivos
- **Tamagui** - UI Library moderna e performática
- **Zustand** - Gerenciamento de estado global
- **Axios** - Cliente HTTP para APIs
- **TypeScript** - Tipagem estática
- **React Native Reanimated** - Animações fluidas

## 📂 Estrutura do Projeto

```
src/
├── screens/          # Telas do aplicativo
├── components/       # Componentes reutilizáveis
├── navigation/       # Configuração de navegação
├── hooks/           # Hooks customizados (Zustand stores)
├── services/        # Chamadas de API (Axios)
├── utils/           # Funções utilitárias
├── theme/           # Configuração do Tamagui
└── assets/          # Imagens, ícones, fontes
```

## 🛠️ Instalação

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd easy-imovel
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Execute o projeto**
   ```bash
   # Para desenvolvimento
   npm start

   # Para Android
   npm run android

   # Para iOS
   npm run ios

   # Para Web
   npm run web
   ```

## 🎨 Configuração do Tamagui

O Tamagui está configurado com:

- **Temas**: Light e Dark mode
- **Tokens**: Espaçamentos, tamanhos, cores e bordas personalizados
- **Componentes**: YStack, XStack, Text, Button, Card, etc.

### Cores do Tema

**Light Mode:**
- Primary: `#007AFF`
- Secondary: `#5856D6`
- Background: `#FFFFFF`

**Dark Mode:**
- Primary: `#0A84FF`
- Secondary: `#5E5CE6`
- Background: `#000000`

## 🗃️ Gerenciamento de Estado

O Zustand está configurado com um exemplo de store de autenticação:

```typescript
import { useAuthStore } from '@/src/hooks/useAuthStore';

// Em um componente
const { user, isAuthenticated, login, logout } = useAuthStore();
```

## 🌐 Serviços de API

O Axios está configurado com:

- Base URL configurável
- Interceptors para autenticação
- Tratamento de erros
- Exemplos de serviços (auth, properties)

```typescript
import { authService, propertyService } from '@/src/services/api';

// Exemplo de uso
const user = await authService.login(email, password);
const properties = await propertyService.getProperties();
```

## 🛠️ Utilitários

### Formatadores
- `formatCurrency()` - Formatar valores monetários
- `formatDate()` - Formatar datas
- `formatPhone()` - Formatar telefones
- `formatArea()` - Formatar área em m²

### Validadores
- `isValidEmail()` - Validar email
- `isValidPhone()` - Validar telefone brasileiro
- `isValidCPF()` - Validar CPF
- `isRequired()` - Validar campos obrigatórios

## 📱 Telas

### HomeScreen
- Interface construída com componentes Tamagui
- Navegação para DetailsScreen
- Exemplo de uso de YStack, Button, Text

### DetailsScreen
- Demonstra uso do Zustand store
- Exemplo de autenticação
- Interface responsiva com Cards

## 🔧 Desenvolvimento

### Adicionando Nova Tela

1. Crie o arquivo em `src/screens/`
2. Use componentes do Tamagui
3. Adicione a rota no Expo Router

### Adicionando Novo Store

1. Crie o hook em `src/hooks/`
2. Use o padrão Zustand
3. Exporte as interfaces TypeScript

### Adicionando Novo Serviço

1. Crie o serviço em `src/services/`
2. Use a instância do Axios configurada
3. Adicione tratamento de erros

## 📦 Scripts Disponíveis

- `npm start` - Inicia o servidor de desenvolvimento
- `npm run android` - Executa no Android
- `npm run ios` - Executa no iOS  
- `npm run web` - Executa no navegador

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.
