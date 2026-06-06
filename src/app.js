// app.js - Demo de Input con validaciones
import { runApp, Scaffold, AppBar, Container, Column, Row, Text, Input, Button, colors } from './index.js';

const InputTestDemo = () => {
    // Referencias para ejemplos interactivos
    const emailInput = Input({
        validation: "email",
        placeholder: "usuario@ejemplo.com",
        label: "Email (validación)",
        fullWidth: true
    });

    const numbersInput = Input({
        validation: "numbers",
        placeholder: "Solo números",
        label: "Números (teclado numérico)",
        fullWidth: true
    });

    const lettersInput = Input({
        validation: "letters",
        placeholder: "Solo letras",
        label: "Letras",
        fullWidth: true
    });

    const requiredInput = Input({
        required: true,
        placeholder: "Campo requerido",
        label: "Requerido",
        fullWidth: true
    });

    const passwordInput = Input({
        type: "password",
        placeholder: "Contraseña",
        label: "Contraseña (con toggle)",
        fullWidth: true
    });

    const telInput = Input({
        type: "tel",
        placeholder: "+34 123 456 789",
        label: "Teléfono (teclado telefónico)",
        fullWidth: true
    });

    const urlInput = Input({
        type: "url",
        placeholder: "https://ejemplo.com",
        label: "URL (teclado con .com)",
        fullWidth: true
    });

    const searchInput = Input({
        type: "search",
        placeholder: "Buscar...",
        label: "Búsqueda (teclado con lupa)",
        fullWidth: true
    });

    const maxLengthInput = Input({
        maxLength: 10,
        placeholder: "Máx 10 caracteres",
        label: "Límite de caracteres",
        fullWidth: true
    });

    const iconInput = Input({
        iconLeft: "search",
        placeholder: "Buscar con ícono",
        label: "Con ícono izquierdo",
        fullWidth: true
    });

    // Estado para toggle de contraseña
    let passwordVisible = false;
    const togglePasswordBtn = Button({
        text: "👁️ Mostrar",
        size: "small",
        variant: "outlined",
        onPress: () => {
            passwordVisible = !passwordVisible;
            passwordInput.update({ type: passwordVisible ? "text" : "password" });
            togglePasswordBtn.update({ text: passwordVisible ? "🙈 Ocultar" : "👁️ Mostrar" });
        }
    });

    // Botón para validar todos
    const validateAllBtn = Button({
        text: "✅ Validar todos los campos",
        variant: "filled",
        bgColor: colors.primary,
        fullWidth: true,
        onPress: () => {
            const emailValid = emailInput.validate();
            const numbersValid = numbersInput.validate();
            const lettersValid = lettersInput.validate();
            const requiredValid = requiredInput.validate();
            
            console.log("📊 Resultados de validación:");
            console.log("Email:", emailValid.valid, emailValid.message);
            console.log("Números:", numbersValid.valid, numbersValid.message);
            console.log("Letras:", lettersValid.valid, lettersValid.message);
            console.log("Requerido:", requiredValid.valid, requiredValid.message);
            
            alert(`Validación completada:\nEmail: ${emailValid.valid ? '✅' : '❌'}\nNúmeros: ${numbersValid.valid ? '✅' : '❌'}\nLetras: ${lettersValid.valid ? '✅' : '❌'}\nRequerido: ${requiredValid.valid ? '✅' : '❌'}`);
        }
    });

    // Botón para resetear todos
    const resetAllBtn = Button({
        text: "🔄 Resetear todos",
        variant: "outlined",
        fullWidth: true,
        onPress: () => {
            emailInput.setValue("");
            numbersInput.setValue("");
            lettersInput.setValue("");
            requiredInput.setValue("");
            passwordInput.setValue("");
            telInput.setValue("");
            urlInput.setValue("");
            searchInput.setValue("");
            maxLengthInput.setValue("");
            iconInput.setValue("");
            console.log("Todos los inputs fueron reseteados");
        }
    });

    return Container({
        padding: 20,
        child: Column({
            gap: 20,
            children: [
                // Título
                Text({ 
                    text: "🧪 Input Validations Demo", 
                    size: 24, 
                    weight: 'bold',
                    color: colors.primary,
                    textAlign: 'center'
                }),
                
                Text({ 
                    text: "Prueba los diferentes tipos de input y validaciones", 
                    size: 12, 
                    color: colors.textSecondary,
                    textAlign: 'center'
                }),

                // ========== SECCIÓN: VALIDACIONES ==========
                Text({ text: "🔐 Validaciones", size: 16, weight: 'bold', marginTop: 8 }),
                emailInput,
                numbersInput,
                lettersInput,
                requiredInput,

                // ========== SECCIÓN: TIPOS DE INPUT ==========
                Text({ text: "📱 Tipos de Input (teclado móvil)", size: 16, weight: 'bold', marginTop: 8 }),
                
                Row({ gap: 8, alignItems: "center", children: [passwordInput, togglePasswordBtn] }),
                telInput,
                urlInput,
                searchInput,

                // ========== SECCIÓN: OTRAS CARACTERÍSTICAS ==========
                Text({ text: "⚙️ Otras características", size: 16, weight: 'bold', marginTop: 8 }),
                maxLengthInput,
                iconInput,

                // ========== BOTONES DE ACCIÓN ==========
                Row({ gap: 12, children: [validateAllBtn, resetAllBtn] })
            ]
        })
    });
};

const App = () => {
    return Scaffold({
        appBar: AppBar({ 
            title: "Input Demo - Validaciones", 
            backgroundColor: colors.primary,
            titleColor: '#fff'
        }),
        body: InputTestDemo()
    });
};

runApp(App, 'root');
