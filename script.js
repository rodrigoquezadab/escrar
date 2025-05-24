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
  // No obtenemos uploadFileInput aquí con const/let al inicio, lo haremos dinámicamente
  // const uploadFileInput = document.getElementById("uploadFileInput"); // ELIMINAR ESTA LÍNEA O HACERLA 'let'
  const uploadDataButton = document.getElementById("uploadDataButton");

  const uploadFileLabel = document.querySelector(
    'label[for="uploadFileInput"]'
  ); // La etiqueta púrpura
  const uploadInputContainer = uploadFileLabel
    ? uploadFileLabel.parentNode
    : null; // Obtener el contenedor de la label y el input

  // Guardamos el texto original del botón de carga (la etiqueta)
  const originalUploadLabelText = uploadFileLabel
    ? uploadFileLabel.textContent
    : "⬆️ Cargar Datos (JSON)";
  // Guardamos el texto original del botón de confirmar carga (el amarillo)
  const originalUploadButtonText = "Confirmar Carga";

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

  const downloadProgramData = () => {
    const dataString = localStorage.getItem("programs");

    if (!dataString || dataString === "[]") {
      alert("No hay programas almacenados para descargar.");
      return;
    }

    let fileName = "programas_almacenados.json";
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
      fileName = "programas_almacenados.txt";
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

  // --- Funciones para manejar el input de archivo dinámicamente ---

  // Obtiene el input de archivo actual del DOM
  const getCurrentFileInput = () => document.getElementById("uploadFileInput");

  // Función para adjuntar/readjuntar los listeners al input de archivo
  const attachFileInputListeners = () => {
    const currentFileInput = getCurrentFileInput();
    if (!currentFileInput) return; // Si no existe, no hacemos nada

    // Asegurarse de no añadir múltiples listeners si ya existen
    currentFileInput.removeEventListener("change", handleFileInputChange);
    currentFileInput.addEventListener("change", handleFileInputChange);
  };

  // Handler para el evento change del input de archivo
  const handleFileInputChange = (e) => {
    console.log("--> EVENTO 'CHANGE' DEL INPUT DE ARCHIVO DETECTADO. (Paso 1)");
    const files = e.target.files;
    if (files.length > 0) {
      fileToUpload = files[0];
      uploadDataButton.style.display = "inline-block";
      uploadDataButton.textContent = `Cargar: ${fileToUpload.name}`;
      if (uploadFileLabel) {
        uploadFileLabel.textContent = `Archivo seleccionado: ${fileToUpload.name}`;
      }
      console.log("Archivo seleccionado:", fileToUpload.name);
      console.log(
        "Botón 'Confirmar Carga' (amarillo) debería ser visible ahora y mostrar el nombre del archivo."
      );
    } else {
      console.log(
        "Selección de archivo cancelada o ningún archivo seleccionado."
      );
      resetUploadControls(); // Llamamos a la función de reseteo aquí
    }
  };

  // Función para resetear completamente el estado de los controles de carga
  const resetUploadControls = () => {
    fileToUpload = null;
    uploadDataButton.style.display = "none";
    uploadDataButton.textContent = originalUploadButtonText;
    if (uploadFileLabel) {
      uploadFileLabel.textContent = originalUploadLabelText;
    }
    // Recrear el input de archivo para asegurar un estado limpio
    recreateFileInput();
  };

  // Función para recrear el input de archivo en el DOM
  const recreateFileInput = () => {
    if (!uploadInputContainer) {
      console.error(
        "No se encontró el contenedor del input de archivo para recrearlo."
      );
      return;
    }

    // Quitar el input actual si existe
    const oldFileInput = getCurrentFileInput();
    if (oldFileInput) {
      oldFileInput.removeEventListener("change", handleFileInputChange); // Eliminar listener del viejo
      oldFileInput.remove(); // Eliminar del DOM
    }

    // Crear un nuevo input
    const newFileInput = document.createElement("input");
    newFileInput.type = "file";
    newFileInput.id = "uploadFileInput";
    newFileInput.accept = ".json";
    newFileInput.classList.add("hidden"); // Asegurar que tenga la clase hidden

    // Insertar el nuevo input dentro del label (ya que en tu HTML está dentro del label)
    // O si está justo después del label, insertarlo como hermano.
    // Revisando tu HTML: el input está *dentro* de la label.
    // Esto significa que necesitamos limpiar el contenido de la label y recrearlo.

    // Opción más robusta si el input está dentro del label:
    // Remover solo el input del label, y luego añadir el nuevo input.
    if (uploadFileLabel) {
      const existingInputInsideLabel =
        uploadFileLabel.querySelector('input[type="file"]');
      if (existingInputInsideLabel) {
        existingInputInsideLabel.remove();
      }
      uploadFileLabel.appendChild(newFileInput);
    } else {
      // Fallback si la label no se encuentra correctamente, aunque debería existir
      uploadInputContainer.appendChild(newFileInput);
    }

    // Volver a adjuntar los listeners al nuevo input
    attachFileInputListeners();
    console.log("Input de archivo recreado y listeners adjuntados.");
  };

  // CUANDO SE HACE CLIC EN EL BOTÓN DE CONFIRMAR CARGA (El botón amarillo)
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
      resetUploadControls(); // Resetear si se cancela la confirmación
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
          resetUploadControls(); // Resetear después de éxito
        } else {
          alert(
            "El archivo JSON no parece contener datos de programas válidos. Asegúrate de que sea un respaldo generado por esta aplicación."
          );
          console.log(
            "Carga fallida: El JSON no tiene la estructura de datos esperada."
          );
          resetUploadControls(); // Resetear después de fallo de validación
        }
      } catch (error) {
        alert(
          "Error al procesar el archivo JSON. Asegúrate de que sea un archivo JSON válido."
        );
        console.error("--> ERROR AL LEER O PARSEAR EL ARCHIVO JSON:", error);
        resetUploadControls(); // Resetear después de fallo de parseo
      }
    };

    reader.onerror = (error) => {
      alert("Error al leer el archivo.");
      console.error(
        "--> ERROR DEL FILEREADER (No se pudo leer el archivo):",
        error
      );
      resetUploadControls(); // Resetear después de fallo del FileReader
    };

    reader.readAsText(fileToUpload);
    console.log("FileReader iniciado para leer el archivo.");
  });

  // ************ Llama a recrear el input al inicio para configurarlo ************
  // Esto asegura que, incluso en la primera carga, se use un input gestionado por nuestro JS
  // y que los listeners estén correctamente adjuntos desde el principio.
  recreateFileInput();
  // *******************************************************************************

  renderPrograms();
});
