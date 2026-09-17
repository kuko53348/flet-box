// core/security/detector.js - VERSIÓN FINAL
const MALICIOUS_PATTERNS = [
  // Caracteres prohibidos
  /[^a-zA-Z0-9\s\-.,\[\]()@]/g,

  // SQL Injection (añadido -- para comentarios)
  /\b(OR|AND|NOT|EXISTS|IN|LIKE|BETWEEN)\b/gi,
  /\b(SELECT|INSERT|UPDATE|DELETE|DROP|TRUNCATE|ALTER|CREATE)\b/gi,
  /\b(UNION|JOIN|INNER|LEFT|RIGHT|FULL|OUTER)\b/gi,
  /\b(WHERE|FROM|INTO|VALUES|SET|TABLE|DATABASE)\b/gi,
  /\b(EXEC|EXECUTE|XP_CMDSHELL|SP_EXECUTESQL)\b/gi,
  /\b(SLEEP|BENCHMARK|WAITFOR|DELAY)\b/gi,
  /--\s*$/gm, // ← Comentario SQL al final
  /;.*--/gi, // ← Comentario SQL en medio

  // Command Injection
  /\b(SYSTEM|SHELL_EXEC|PASSTHRU|POPEN|PROC_OPEN)\b/gi,
  /\b(RM|WGET|CURL|WHOAMI|ID|LS|CAT|ECHO|NC|BASH|SH)\b/gi,
  /\b(PYTHON|PERL|RUBY|PHP|NODE)\b/gi,

  // Log4j / JNDI
  /\b(JNDI|LDAP|RMI|DNS|HTTP|HTTPS)\b/gi,

  // Prototype Pollution
  /\b(PROTO|PROTOTYPE|CONSTRUCTOR|PROTO__)\b/gi,

  // XSS
  /\b(SCRIPT|ALERT|EVAL|PROMPT|CONFIRM|ONERROR|ONLOAD|ONCLICK)\b/gi,
  /\b(EXPRESSION|JAVASCRIPT|VBSCRIPT)\b/gi,
];

const containsMalicious = (value) => {
  if (typeof value === "string") {
    for (const pattern of MALICIOUS_PATTERNS) {
      const regex = new RegExp(pattern.source, pattern.flags);
      if (regex.test(value)) {
        return true;
      }
    }
    return false;
  }

  if (Array.isArray(value)) {
    return value.some((item) => containsMalicious(item));
  }

  if (value !== null && typeof value === "object") {
    for (const key of Object.keys(value)) {
      if (containsMalicious(key)) return true;
      if (containsMalicious(value[key])) return true;
    }
  }

  return false;
};

export const blockMalicious = (req, res, next) => {
  const ip = req.socket.remoteAddress || req.headers["x-forwarded-for"];
  const path = req.url;

  // ✅ REVISAR body, params, query (¡SOLUCIÓN PARA GET!)
  const payload = {
    ...req.body,
    ...req.params,
    ...req.query, // ← AÑADIDO
  };

  if (containsMalicious(payload)) {
    console.log(`🚨 BLOQUEADO - IP: ${ip} - Path: ${path}`);
    console.log(`   Payload: ${JSON.stringify(payload).slice(0, 200)}`);
    return res.error("Forbidden: Contenido malicioso detectado", 403);
  }

  next();
};

export default { blockMalicious, MALICIOUS_PATTERNS };
