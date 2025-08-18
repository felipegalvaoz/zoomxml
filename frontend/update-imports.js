#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Mapeamento dos imports antigos para os novos
const importMappings = {
  // Auth
  '@/components/auth-guard': '@/components/auth/auth-guard',
  '@/components/login-form': '@/components/auth/login-form',
  
  // Dashboard
  '@/components/dashboard-content': '@/components/dashboard/dashboard-content',
  '@/components/dashboard-stats': '@/components/dashboard/dashboard-stats',
  
  // Forms
  '@/components/credential-form': '@/components/forms/credential-form',
  
  // Layout
  '@/components/app-sidebar': '@/components/layout/app-sidebar',
  '@/components/nav-main': '@/components/layout/nav-main',
  '@/components/nav-projects': '@/components/layout/nav-projects',
  '@/components/nav-user': '@/components/layout/nav-user',
  '@/components/team-switcher': '@/components/layout/team-switcher',
  
  // Pages
  '@/components/audit-content': '@/components/pages/audit-content',
  '@/components/companies-content': '@/components/pages/companies-content',
  '@/components/credentials-content': '@/components/pages/credentials-content',
  '@/components/documents-content': '@/components/pages/documents-content',
  '@/components/members-content': '@/components/pages/members-content',
  '@/components/users-content': '@/components/pages/users-content',
  
  // Providers
  '@/components/theme-provider': '@/components/providers/theme-provider'
};

function updateImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Atualizar imports
    for (const [oldImport, newImport] of Object.entries(importMappings)) {
      const regex = new RegExp(oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      if (content.includes(oldImport)) {
        content = content.replace(regex, newImport);
        updated = true;
        console.log(`✅ Updated: ${oldImport} → ${newImport} in ${filePath}`);
      }
    }
    
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

function findTsxFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      findTsxFiles(fullPath, files);
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function main() {
  console.log('🔄 Atualizando imports dos componentes...\n');
  
  const appDir = path.join(__dirname, 'app');
  const componentsDir = path.join(__dirname, 'components');
  
  const files = [
    ...findTsxFiles(appDir),
    ...findTsxFiles(componentsDir)
  ];
  
  let updatedCount = 0;
  
  for (const file of files) {
    if (updateImportsInFile(file)) {
      updatedCount++;
    }
  }
  
  console.log(`\n✅ Concluído! ${updatedCount} arquivos atualizados.`);
}

if (require.main === module) {
  main();
}
