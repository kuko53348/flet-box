#!/bin/bash

# ============================================
# NPM PACKAGE MANAGER - CRUD operations
# ============================================

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
PACKAGE_NAME="flet-box"  # Cambia esto por tu paquete

# ============================================
# 1. LISTAR paquetes
# ============================================
list_packages() {
    echo -e "${BLUE}📦 Listando paquetes globales...${NC}"
    npm list -g --depth=0
    
    echo -e "\n${YELLOW}🔗 Paquetes linkeados globalmente:${NC}"
    ls -la $(npm root -g) 2>/dev/null | grep "^l" || echo "No hay paquetes linkeados"
    
    echo -e "\n${YELLOW}📁 Paquetes linkeados en proyecto actual:${NC}"
    if [ -d "node_modules" ]; then
        ls -la node_modules/ 2>/dev/null | grep "^l" || echo "No hay paquetes linkeados en este proyecto"
    else
        echo "No hay node_modules en este proyecto"
    fi
}

# ============================================
# 2. INSTALAR paquetes
# ============================================
# INSTALAR NORMAL (desde npm registry)
install_normal() {
    echo -e "${BLUE}📦 Instalando $PACKAGE_NAME desde npm registry...${NC}"
    npm install $PACKAGE_NAME
}

# INSTALAR COMO DEPENDENCIA DE DESARROLLO
install_dev() {
    echo -e "${BLUE}📦 Instalando $PACKAGE_NAME como dev dependency...${NC}"
    npm install --save-dev $PACKAGE_NAME
}

# INSTALAR GLOBAL
install_global() {
    echo -e "${BLUE}📦 Instalando $PACKAGE_NAME globalmente...${NC}"
    npm install -g $PACKAGE_NAME
}

# LINK LOCAL (desde carpeta del paquete)
link_local() {
    echo -e "${BLUE}🔗 Creando link local de $PACKAGE_NAME...${NC}"
    cd $PACKAGE_NAME && npm link && cd ..
    echo -e "${GREEN}✅ Paquete linkeado globalmente${NC}"
}

# USAR LINK EN PROYECTO
use_link() {
    echo -e "${BLUE}🔗 Usando $PACKAGE_NAME linkeado en este proyecto...${NC}"
    npm link $PACKAGE_NAME
}

# INSTALAR DESDE RUTA LOCAL
install_local_path() {
    echo -e "${BLUE}📦 Instalando $PACKAGE_NAME desde ruta local...${NC}"
    read -p "Ruta del paquete local: " local_path
    npm install $local_path
}

# ============================================
# 3. ACTUALIZAR paquetes
# ============================================
# ACTUALIZAR PAQUETE ESPECÍFICO
update_package() {
    echo -e "${BLUE}🔄 Actualizando $PACKAGE_NAME...${NC}"
    npm update $PACKAGE_NAME
}

# ACTUALIZAR TODOS LOS PAQUETES
update_all() {
    echo -e "${BLUE}🔄 Actualizando TODOS los paquetes...${NC}"
    npm update
}

# ACTUALIZAR GLOBAL
update_global() {
    echo -e "${BLUE}🔄 Actualizando $PACKAGE_NAME global...${NC}"
    npm update -g $PACKAGE_NAME
}

# RECONSTRUIR LINK (después de cambios en el paquete)
rebuild_link() {
    echo -e "${BLUE}🔄 Reconstruyendo link de $PACKAGE_NAME...${NC}"
    cd $PACKAGE_NAME && npm unlink && npm link && cd ..
    echo -e "${GREEN}✅ Link reconstruido${NC}"
}

# ============================================
# 4. BORRAR paquetes
# ============================================
# BORRAR LINK LOCAL (en proyecto)
unlink_local() {
    echo -e "${RED}🗑️ Eliminando link de $PACKAGE_NAME en este proyecto...${NC}"
    npm unlink $PACKAGE_NAME
}

# BORRAR LINK GLOBAL (desde el paquete)
unlink_global() {
    echo -e "${RED}🗑️ Eliminando link global de $PACKAGE_NAME...${NC}"
    cd $PACKAGE_NAME && npm unlink && cd ..
}

# BORRAR PAQUETE NORMAL
uninstall_package() {
    echo -e "${RED}🗑️ Desinstalando $PACKAGE_NAME...${NC}"
    npm uninstall $PACKAGE_NAME
}

# BORRAR PAQUETE GLOBAL
uninstall_global() {
    echo -e "${RED}🗑️ Desinstalando $PACKAGE_NAME global...${NC}"
    npm uninstall -g $PACKAGE_NAME
}

# BORRAR NODE_MODULES COMPLETO
clean_node_modules() {
    echo -e "${RED}🗑️ Eliminando node_modules completo...${NC}"
    read -p "¿Estás seguro? (y/n): " confirm
    if [ "$confirm" = "y" ]; then
        rm -rf node_modules
        rm -f package-lock.json
        echo -e "${GREEN}✅ node_modules eliminado${NC}"
    else
        echo "Cancelado"
    fi
}

# BORRAR CACHÉ DE NPM
clear_cache() {
    echo -e "${RED}🗑️ Limpiando caché de npm...${NC}"
    npm cache clean --force
    echo -e "${GREEN}✅ Caché limpiado${NC}"
}

# ============================================
# 5. VERIFICAR
# ============================================
check_package() {
    echo -e "${BLUE}🔍 Verificando $PACKAGE_NAME...${NC}"
    
    # Verificar global
    if npm list -g --depth=0 | grep -q "$PACKAGE_NAME"; then
        echo -e "${GREEN}✅ Instalado globalmente${NC}"
        npm list -g --depth=0 | grep "$PACKAGE_NAME"
    else
        echo -e "${RED}❌ No está instalado globalmente${NC}"
    fi
    
    # Verificar local
    if [ -d "node_modules/$PACKAGE_NAME" ]; then
        echo -e "${GREEN}✅ Instalado localmente${NC}"
        ls -la node_modules/$PACKAGE_NAME 2>/dev/null | head -1
    else
        echo -e "${RED}❌ No está instalado localmente${NC}"
    fi
    
    # Verificar si es link
    if [ -L "node_modules/$PACKAGE_NAME" ] 2>/dev/null; then
        echo -e "${YELLOW}🔗 Es un enlace simbólico (link)${NC}"
        ls -la node_modules/$PACKAGE_NAME
    fi
}

# ============================================
# MENÚ PRINCIPAL
# ============================================
show_menu() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${GREEN}📦 NPM PACKAGE MANAGER - $PACKAGE_NAME${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo "1. 📋 LISTAR paquetes"
    echo "2. 📥 INSTALAR (desde npm registry)"
    echo "3. 📥 INSTALAR como dev dependency"
    echo "4. 🌍 INSTALAR global"
    echo "5. 🔗 LINK local (crear enlace global)"
    echo "6. 🔗 USAR link en este proyecto"
    echo "7. 📁 INSTALAR desde ruta local"
    echo "8. 🔄 ACTUALIZAR paquete"
    echo "9. 🔄 ACTUALIZAR todos los paquetes"
    echo "10. 🔄 RECONSTRUIR link (después de cambios)"
    echo "11. 🗑️ UNLINK local (en proyecto)"
    echo "12. 🗑️ UNLINK global (eliminar enlace global)"
    echo "13. 🗑️ DESINSTALAR paquete"
    echo "14. 🗑️ DESINSTALAR global"
    echo "15. 🧹 LIMPIAR node_modules completo"
    echo "16. 🧹 LIMPIAR caché de npm"
    echo "17. 🔍 VERIFICAR estado del paquete"
    echo "0. ❌ Salir"
    echo -e "${BLUE}========================================${NC}"
    read -p "Selecciona una opción: " option
}

# ============================================
# MAIN LOOP
# ============================================
while true; do
    show_menu
    case $option in
        1) list_packages ;;
        2) install_normal ;;
        3) install_dev ;;
        4) install_global ;;
        5) link_local ;;
        6) use_link ;;
        7) install_local_path ;;
        8) update_package ;;
        9) update_all ;;
        10) rebuild_link ;;
        11) unlink_local ;;
        12) unlink_global ;;
        13) uninstall_package ;;
        14) uninstall_global ;;
        15) clean_node_modules ;;
        16) clear_cache ;;
        17) check_package ;;
        0) echo -e "${GREEN}👋 Adiós!${NC}"; exit 0 ;;
        *) echo -e "${RED}❌ Opción inválida${NC}" ;;
    esac
    echo ""
    read -p "Presiona Enter para continuar..."
done
