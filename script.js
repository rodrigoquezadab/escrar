document.addEventListener("DOMContentLoaded", () => {
  const programForm = document.getElementById("programForm");
  const programIdInput = document.getElementById("programId");
  const nameInput = document.getElementById("name");
  const versionInput = document.getElementById("version");
  const usageInfoInput = document.getElementById("usageInfo");
  const urlInput = document.getElementById("url");
  const addButton = document.getElementById("addButton");
  const updateButton = document.getElementById("updateButton");
  const cancelButton = document.getElementById("cancelButton");
  const programsListDiv = document.getElementById("programsList");
  const searchInput = document.getElementById("searchInput");

  const downloadDataButton = document.getElementById("downloadDataButton");
  const uploadDataButton = document.getElementById("uploadDataButton");

  const uploadFileLabel = document.querySelector(
    'label[for="uploadFileInput"]'
  );
  const uploadInputContainer = uploadFileLabel
    ? uploadFileLabel.parentNode
    : null;

  // Guardamos los textos originales para restablecerlos
  const originalUploadLabelText = "⬆️ Cargar Datos (JSON)"; // Texto inicial del botón púrpura
  const selectNewFileLabelText = "Cambiar Archivo"; // Texto del botón púrpura cuando ya hay un archivo seleccionado
  const originalUploadButtonText = "Confirmar Carga"; // Texto inicial del botón amarillo

  let programs = JSON.parse(localStorage.getItem("programs")) || [];
  let editingProgramId = null;
  let fileToUpload = null;

  const generateId = () =>
    "_" + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

  const renderPrograms = (programsToRender = programs) => {
    programsListDiv.innerHTML = "";
    if (programsToRender.length === 0) {
      programsListDiv.innerHTML =
        "<p class='text-center text-gray-500 italic'>No hay programas almacenados.</p>";
      return;
    }

    programsToRender.forEach((program) => {
      const programElement = document.createElement("div");
      programElement.classList.add(
        "program-item",
        "bg-white",
        "p-4",
        "rounded-lg",
        "shadow-sm",
        "border",
        "border-gray-200"
      );
      programElement.setAttribute("data-id", program.id);
      programElement.innerHTML = `
                <h3 class="text-xl font-semibold text-blue-600 mb-2">${program.name} (v${program.version})</h3>
                <p class="text-gray-700 mb-1"><strong>Información de Uso:</strong> ${program.usageInfo}</p>
                <p class="text-gray-700 mb-2"><strong>URL:</strong> <a href="${program.url}" target="_blank" class="text-blue-500 hover:underline break-all">${program.url}</a></p>
                <div class="flex justify-end space-x-2 mt-4">
                    <button class="edit-btn bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 ease-in-out" onclick="editProgram('${program.id}')">✏️ Editar</button>
                    <button class="delete-btn bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 ease-in-out" onclick="deleteProgram('${program.id}')">🗑️ Eliminar</button>
                </div>
            `;
      programsListDiv.appendChild(programElement);
    });
  };

  const savePrograms = () => {
    localStorage.setItem("programs", JSON.stringify(programs));
  };

  const resetForm = () => {
    programForm.reset();
    programIdInput.value = "";
    editingProgramId = null;
    addButton.style.display = "inline-block";
    updateButton.style.display = "none";
    cancelButton.style.display = "none";
    nameInput.focus();
  };

  programForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const version = versionInput.value.trim();
    const usageInfo = usageInfoInput.value.trim();
    const url = urlInput.value.trim();

    if (!name || !version || !usageInfo || !url) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    if (editingProgramId) {
      const programIndex = programs.findIndex((p) => p.id === editingProgramId);
      if (programIndex > -1) {
        programs[programIndex] = {
          id: editingProgramId,
          name,
          version,
          usageInfo,
          url,
        };
      }
    } else {
      const newProgram = {
        id: generateId(),
        name,
        version,
        usageInfo,
        url,
      };
      programs.push(newProgram);
    }

    savePrograms();
    renderPrograms();
    resetForm();
  });

  window.editProgram = (id) => {
    const programToEdit = programs.find((p) => p.id === id);
    if (programToEdit) {
      editingProgramId = id;
      programIdInput.value = programToEdit.id;
      nameInput.value = programToEdit.name;
      versionInput.value = programToEdit.version;
      usageInfoInput.value = programToEdit.usageInfo;
      urlInput.value = programToEdit.url;

      addButton.style.display = "none";
      updateButton.style.display = "inline-block";
      cancelButton.style.display = "inline-block";
      nameInput.focus();
      window.scrollTo(0, 0);
    }
  };

  window.deleteProgram = (id) => {
    if (confirm("¿Estás seguro de que deseas eliminar este programa?")) {
      programs = programs.filter((p) => p.id !== id);
      savePrograms();
      renderPrograms();
      if (editingProgramId === id) {
        resetForm();
      }
    }
  };

  cancelButton.addEventListener("click", () => {
    resetForm();
  });

  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredPrograms = programs.filter(
      (program) =>
        program.name.toLowerCase().includes(searchTerm) ||
        program.version.toLowerCase().includes(searchTerm) ||
        program.usageInfo.toLowerCase().includes(searchTerm)
    );
    renderPrograms(filteredPrograms);
  });

  // ... (código anterior sin cambios) ...

  const downloadProgramData = () => {
    const dataString = localStorage.getItem("programs");

    if (!dataString || dataString === "[]") {
      alert("No hay programas almacenados para descargar.");
      return;
    }

    // --- CAMBIO CLAVE AQUÍ: Generar el nombre del archivo con fecha y hora ---
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0"); // Mes 0-11, padStart para 2 dígitos
    const day = now.getDate().toString().padStart(2, "0");
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");

    // Formato: programas_almacenados_AAAA-MM-DD_HHMMSS.json
    let fileName = `programas_almacenados_${year}-${month}-${day}_${hours}${minutes}${seconds}.json`;
    // ----------------------------------------------------------------------

    let dataToDownload = dataString;
    let mimeType = "application/json";

    try {
      const parsedData = JSON.parse(dataString);
      dataToDownload = JSON.stringify(parsedData, null, 2);
    } catch (error) {
      console.warn(
        "No se pudo formatear el JSON, se descargará el texto plano.",
        error
      );
      // Si falla el parseo, se mantiene el nombre con .json pero el contenido será texto plano
      // Podrías cambiarlo a .txt si lo prefieres en caso de error, pero generalmente no debería ocurrir si los datos de localStorage son JSON
      // fileName = fileName.replace(".json", ".txt"); // Descomentar si prefieres .txt en caso de error
      mimeType = "text/plain";
    }

    const blob = new Blob([dataToDownload], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (downloadDataButton) {
    downloadDataButton.addEventListener("click", downloadProgramData);
  }

  // ... (resto del script sin cambios) ...

  if (downloadDataButton) {
    downloadDataButton.addEventListener("click", downloadProgramData);
  }

  // --- Funciones para manejar el input de archivo dinámicamente ---

  const getCurrentFileInput = () => document.getElementById("uploadFileInput");

  const attachFileInputListeners = () => {
    const currentFileInput = getCurrentFileInput();
    if (!currentFileInput) return;

    currentFileInput.removeEventListener("change", handleFileInputChange);
    currentFileInput.addEventListener("change", handleFileInputChange);
  };

  const handleFileInputChange = (e) => {
    console.log("--> EVENTO 'CHANGE' DEL INPUT DE ARCHIVO DETECTADO. (Paso 1)");
    const files = e.target.files;
    if (files.length > 0) {
      fileToUpload = files[0];
      uploadDataButton.style.display = "inline-block";
      uploadDataButton.textContent = `Cargar: ${fileToUpload.name}`; // El amarillo siempre muestra el nombre

      // El púrpura cambia a "Cambiar Archivo"
      if (uploadFileLabel) {
        uploadFileLabel.textContent = selectNewFileLabelText; // "Cambiar Archivo"
      }
      console.log("Archivo seleccionado:", fileToUpload.name);
      console.log(
        "Botón 'Confirmar Carga' (amarillo) debería ser visible ahora y mostrar el nombre del archivo."
      );
    } else {
      // Si el usuario cancela la selección de archivo (cierra la ventana de selección sin elegir nada)
      console.log(
        "Selección de archivo cancelada o ningún archivo seleccionado."
      );
      resetUploadControls(); // Llamamos a la función de reseteo aquí para volver al estado inicial
    }
  };

  const resetUploadControls = () => {
    fileToUpload = null;
    uploadDataButton.style.display = "none";
    uploadDataButton.textContent = originalUploadButtonText; // El amarillo vuelve a su texto original (aunque estará oculto)
    if (uploadFileLabel) {
      uploadFileLabel.textContent = originalUploadLabelText; // El púrpura vuelve a su texto original
    }
    recreateFileInput(); // Recrear el input de archivo para asegurar un estado limpio
  };

  const recreateFileInput = () => {
    if (!uploadFileLabel) {
      // Verificamos que la label exista
      console.error(
        "No se encontró la etiqueta 'uploadFileLabel'. No se puede recrear el input."
      );
      return;
    }

    const oldFileInput = getCurrentFileInput();
    if (oldFileInput) {
      oldFileInput.removeEventListener("change", handleFileInputChange);
      oldFileInput.remove();
    }

    const newFileInput = document.createElement("input");
    newFileInput.type = "file";
    newFileInput.id = "uploadFileInput";
    newFileInput.accept = ".json";
    newFileInput.classList.add("hidden");

    // Insertar el nuevo input dentro de la label
    uploadFileLabel.appendChild(newFileInput);

    attachFileInputListeners();
    console.log("Input de archivo recreado y listeners adjuntados.");
  };

  uploadDataButton.addEventListener("click", () => {
    console.log("--> BOTÓN 'CARGAR DATOS' (AMARILLO) CLICKEADO. (Paso 2)");
    if (!fileToUpload) {
      alert("Por favor, selecciona un archivo JSON para cargar.");
      console.log("No hay archivo en 'fileToUpload', deteniendo la carga.");
      return;
    }

    if (
      !confirm(
        "¿Estás seguro de que quieres cargar estos datos? Esto sobrescribirá tus programas actuales."
      )
    ) {
      console.log("Carga cancelada por el usuario.");
      resetUploadControls();
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      console.log("--> ARCHIVO LEÍDO POR FILEREADER. (Paso 3)");
      try {
        const uploadedData = JSON.parse(event.target.result);
        console.log("Datos parseados del JSON:", uploadedData);

        if (
          Array.isArray(uploadedData) &&
          uploadedData.every((p) => p && p.id && p.name && p.version)
        ) {
          programs = uploadedData;
          savePrograms();
          renderPrograms();
          alert("Datos cargados exitosamente.");
          console.log("Carga de datos exitosa. Restableciendo UI.");
          resetUploadControls();
        } else {
          alert(
            "El archivo JSON no parece contener datos de programas válidos. Asegúrate de que sea un respaldo generado por esta aplicación."
          );
          console.log(
            "Carga fallida: El JSON no tiene la estructura de datos esperada."
          );
          resetUploadControls();
        }
      } catch (error) {
        alert(
          "Error al procesar el archivo JSON. Asegúrate de que sea un archivo JSON válido."
        );
        console.error("--> ERROR AL LEER O PARSEAR EL ARCHIVO JSON:", error);
        resetUploadControls();
      }
    };

    reader.onerror = (error) => {
      alert("Error al leer el archivo.");
      console.error(
        "--> ERROR DEL FILEREADER (No se pudo leer el archivo):",
        error
      );
      resetUploadControls();
    };

    reader.readAsText(fileToUpload);
    console.log("FileReader iniciado para leer el archivo.");
  });

  // Llama a recrear el input al inicio para configurarlo
  recreateFileInput();
  // Al inicio, aseguramos que el botón amarillo esté oculto.
  uploadDataButton.style.display = "none";
  uploadDataButton.textContent = originalUploadButtonText; // Asegura el texto inicial del amarillo

  renderPrograms();
});
