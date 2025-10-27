#!/bin/bash

echo "🚀 Iniciando build para produção..."

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Build do frontend
echo "🔨 Fazendo build do frontend..."
cd frontend
npm install
npm run build
cd ..

echo "✅ Build concluído!"
echo "📁 Arquivos de produção em: frontend/dist/"
echo "🚀 Para rodar em produção: npm start"
