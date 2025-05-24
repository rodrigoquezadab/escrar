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
  const uploadDataButton = document.getElementById("uploadDataButton"); // Botón amarillo "Cargar: [nombre]"
  const removeDuplicatesButton = document.getElementById(
    "removeDuplicatesButton"
  ); // Botón "Eliminar Duplicados"
  const cancelUploadFlowButton = document.getElementById(
    "cancelUploadFlowButton"
  ); // Botón de cancelar flujo

  const uploadFileLabel = document.getElementById("uploadFileLabel"); // Ahora obtenemos por ID
  const uploadFileInputContainer = document.getElementById(
    "uploadFileInputContainer"
  ); // Nuevo contenedor para el input

  // Guardamos los textos originales para restablecerlos
  const originalUploadLabelText = "⬆️ Cargar Datos (JSON)";
  const selectNewFileLabelText = "Cambiar Archivo";
  const originalUploadButtonText = "Confirmar Carga";

  let programs = JSON.parse(localStorage.getItem("programs")) || [];
  let editingProgramId = null;
  let fileToUpload = null;
  let uploadedProgramsData = null; // Para almacenar los datos del JSON cargado temporalmente

  // Referencias del modal
  const importOptionsModal = document.getElementById("importOptionsModal");
  const importReplaceBtn = document.getElementById("importReplaceBtn");
  const importAddBtn = document.getElementById("importAddBtn");
  const importUpdateBtn = document.getElementById("importUpdateBtn");
  const cancelImportBtn = document.getElementById("cancelImportBtn");

  const generateId = () =>
    "_" + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

  // ... (código existente de script.js hasta la función renderPrograms) ...

  const renderPrograms = (programsToRender = programs) => {
    programsListDiv.innerHTML = "";
    if (programsToRender.length === 0) {
      programsListDiv.innerHTML =
        "<p class='text-center text-gray-500 italic'>No hay programas almacenados.</p>";
      removeDuplicatesButton.style.display = "none";
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
        "border-gray-200",
        "flex", // Hacemos que el contenedor sea flex
        "flex-col", // En pantallas pequeñas será columna
        "md:flex-row", // En pantallas medianas y grandes será fila
        "gap-4" // Espacio entre las columnas
      );
      programElement.setAttribute("data-id", program.id);
      programElement.innerHTML = `
        <div class="flex-grow md:w-3/4"> <h3 class="text-xl font-semibold text-blue-600 mb-2">${program.name} (v${program.version})</h3>
          <p class="text-gray-700 mb-1"><strong>Información de Uso:</strong> ${program.usageInfo}</p>
          <p class="text-gray-700 mb-2"><strong>URL:</strong> <a href="${program.url}" target="_blank" class="text-blue-500 hover:underline break-all">${program.url}</a></p>
        </div>
        <div class="flex flex-col space-y-2 md:w-1/4 md:justify-center"> <button class="edit-btn bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 ease-in-out" onclick="editProgram('${program.id}')">✏️ Editar</button>
          <button class="delete-btn bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 ease-in-out" onclick="deleteProgram('${program.id}')">🗑️ Eliminar</button>
        </div>
      `;
      programsListDiv.appendChild(programElement);
    });

    checkAndShowRemoveDuplicatesButton();
  };

  // ... (resto del código existente de script.js) ...

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

    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");

    let fileName = `programas_almacenados_${year}-${month}-${day}_${hours}${minutes}${seconds}.json`;

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

  // --- Funciones para manejar el input de archivo dinámicamente y las importaciones ---

  // Obtiene la referencia actual al input de archivo (ya que puede ser recreado)
  const getCurrentFileInput = () => document.getElementById("uploadFileInput");

  // Adjunta el event listener 'change' al input de archivo actual
  const attachFileInputListener = () => {
    const currentFileInput = getCurrentFileInput();
    if (!currentFileInput) {
      console.error(
        "No se encontró el input de archivo. Fallo al adjuntar listener."
      );
      return;
    }

    // Asegurarse de que no haya múltiples listeners adjuntos
    currentFileInput.removeEventListener("change", handleFileInputChange);
    currentFileInput.addEventListener("change", handleFileInputChange);
    console.log("Listener 'change' adjuntado al input de archivo.");
  };

  const handleFileInputChange = (e) => {
    console.log("--> EVENTO 'CHANGE' DEL INPUT DE ARCHIVO DETECTADO. (Paso 1)");
    const files = e.target.files;
    if (files.length > 0) {
      fileToUpload = files[0];
      uploadDataButton.style.display = "inline-block";
      uploadDataButton.textContent = `Cargar: ${fileToUpload.name}`;

      // Mostrar el botón de cancelar carga
      cancelUploadFlowButton.style.display = "inline-block";

      if (uploadFileLabel) {
        uploadFileLabel.textContent = selectNewFileLabelText; // Cambiar texto del botón púrpura a "Cambiar Archivo"
      }
      console.log("Archivo seleccionado:", fileToUpload.name);
      console.log(
        "Botón 'Confirmar Carga' (amarillo) y 'Cancelar Carga' (gris) deberían ser visibles ahora."
      );
    } else {
      // Si el usuario cancela la selección de archivo (cierra la ventana de selección sin elegir nada)
      console.log(
        "Selección de archivo cancelada o ningún archivo seleccionado."
      );
      // No llamar a resetUploadControls() aquí directamente, ya que un "cancel" del diálogo no es un reset completo del flujo
      // El reset se hace al llamar a la función cancelar carga o al importar.
      // Para este caso, solo asegurar que el input.value se limpia si no se selecciona nada.
      const currentFileInput = getCurrentFileInput();
      if (currentFileInput) {
        currentFileInput.value = ""; // Limpiar el valor para permitir seleccionar el mismo archivo después
      }
    }
  };

  const resetUploadControls = () => {
    fileToUpload = null;
    uploadedProgramsData = null; // Limpiar los datos cargados del archivo
    uploadDataButton.style.display = "none";
    uploadDataButton.textContent = originalUploadButtonText;
    cancelUploadFlowButton.style.display = "none"; // Ocultar al resetear
    if (uploadFileLabel) {
      uploadFileLabel.textContent = originalUploadLabelText; // Volver al texto original del botón púrpura
    }
    recreateFileInput(); // ¡CRUCIAL! Recrear el input para un estado limpio
    console.log(
      "Controles de carga reseteados. Input de archivo listo para nueva selección."
    );
  };

  // Recrea el input de tipo file para asegurar que el evento 'change' se dispare siempre
  const recreateFileInput = () => {
    const oldFileInput = getCurrentFileInput();
    if (oldFileInput) {
      oldFileInput.removeEventListener("change", handleFileInputChange); // Remover listener del viejo
      oldFileInput.remove(); // Eliminar el input viejo
      console.log("Input de archivo anterior eliminado.");
    }

    const newFileInput = document.createElement("input");
    newFileInput.type = "file";
    newFileInput.id = "uploadFileInput"; // Mismo ID para que el label 'for' funcione
    newFileInput.accept = ".json";
    newFileInput.classList.add("hidden"); // Asegurarse de que esté oculto

    // Adjuntar el nuevo input al contenedor dedicado
    uploadFileInputContainer.appendChild(newFileInput);
    // Y luego adjuntar el listener al nuevo input
    attachFileInputListener();
    console.log("Nuevo input de archivo recreado y listener adjuntado.");
  };

  // --- Lógica de importación ---

  const processUploadedData = (data, importType) => {
    let currentPrograms = programs;
    let updatedCount = 0;
    let addedCount = 0;

    if (importType === "replace") {
      currentPrograms = data;
    } else {
      const existingIds = new Set(currentPrograms.map((p) => p.id));

      data.forEach((uploadedProgram) => {
        if (!uploadedProgram || !uploadedProgram.id) {
          console.warn(
            "Programa inválido en el archivo cargado, ignorando:",
            uploadedProgram
          );
          return;
        }

        if (existingIds.has(uploadedProgram.id)) {
          if (importType === "update") {
            const index = currentPrograms.findIndex(
              (p) => p.id === uploadedProgram.id
            );
            if (index !== -1) {
              currentPrograms[index] = uploadedProgram;
              updatedCount++;
            }
          }
        } else {
          currentPrograms.push(uploadedProgram);
          addedCount++;
        }
      });
    }

    programs = currentPrograms;
    savePrograms();
    renderPrograms();

    let message = "Datos cargados exitosamente.";
    if (importType === "replace") {
      message += ` Se reemplazaron ${data.length} programas.`;
    } else if (importType === "add") {
      message += ` Se añadieron ${addedCount} nuevos programas.`;
    } else if (importType === "update") {
      message += ` Se añadieron ${addedCount} nuevos programas y se actualizaron ${updatedCount} existentes.`;
    }
    alert(message);
    console.log("Carga de datos exitosa. Restableciendo UI.");
  };

  // Evento para mostrar el modal de opciones de importación (al hacer clic en el botón amarillo)
  uploadDataButton.addEventListener("click", () => {
    console.log("--> BOTÓN 'CARGAR DATOS' (AMARILLO) CLICKEADO. (Paso 2)");
    if (!fileToUpload) {
      alert("Por favor, selecciona un archivo JSON para cargar.");
      console.log("No hay archivo en 'fileToUpload', deteniendo la carga.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      console.log("--> ARCHIVO LEÍDO POR FILEREADER. (Paso 3)");
      try {
        const parsedData = JSON.parse(event.target.result);
        console.log("Datos parseados del JSON:", parsedData);

        if (
          Array.isArray(parsedData) &&
          parsedData.every((p) => p && p.id && p.name && p.version)
        ) {
          uploadedProgramsData = parsedData;
          importOptionsModal.classList.remove("hidden"); // Mostrar el modal
        } else {
          alert(
            "El archivo JSON no parece contener datos de programas válidos. Asegúrate de que sea un respaldo generado por esta aplicación."
          );
          console.log(
            "Carga fallida: El JSON no tiene la estructura de datos esperada."
          );
          resetUploadControls(); // Asegurarse de que se resetee y se recree el input
        }
      } catch (error) {
        alert(
          "Error al procesar el archivo JSON. Asegúrate de que sea un archivo JSON válido."
        );
        console.error("--> ERROR AL LEER O PARSEAR EL ARCHIVO JSON:", error);
        resetUploadControls(); // Asegurarse de que se resetee y se recree el input
      }
    };

    reader.onerror = (error) => {
      alert("Error al leer el archivo.");
      console.error(
        "--> ERROR DEL FILEREADER (No se pudo leer el archivo):",
        error
      );
      resetUploadControls(); // Asegurarse de que se resetee y se recree el input
    };

    reader.readAsText(fileToUpload);
    console.log("FileReader iniciado para leer el archivo.");
  });

  // Eventos de los botones del modal
  importReplaceBtn.addEventListener("click", () => {
    if (uploadedProgramsData) {
      if (
        confirm(
          "Esta opción borrará todos los programas actuales y los reemplazará. ¿Estás seguro?"
        )
      ) {
        processUploadedData(uploadedProgramsData, "replace");
        importOptionsModal.classList.add("hidden");
        resetUploadControls();
      }
    }
  });

  importAddBtn.addEventListener("click", () => {
    if (uploadedProgramsData) {
      if (
        confirm(
          "Esta opción añadirá los programas nuevos, ignorando los que ya existen por ID. ¿Deseas continuar?"
        )
      ) {
        processUploadedData(uploadedProgramsData, "add");
        importOptionsModal.classList.add("hidden");
        resetUploadControls();
      }
    }
  });

  importUpdateBtn.addEventListener("click", () => {
    if (uploadedProgramsData) {
      if (
        confirm(
          "Esta opción añadirá programas nuevos y actualizará los existentes por ID. ¿Deseas continuar?"
        )
      ) {
        processUploadedData(uploadedProgramsData, "update");
        importOptionsModal.classList.add("hidden");
        resetUploadControls();
      }
    }
  });

  // Listener para el botón "Cancelar" dentro del modal
  cancelImportBtn.addEventListener("click", () => {
    importOptionsModal.classList.add("hidden");
    resetUploadControls(); // Resetea todo el estado de carga y recrea el input
  });

  // Listener para el botón de cancelar flujo de carga (fuera del modal)
  cancelUploadFlowButton.addEventListener("click", () => {
    console.log("Flujo de carga de archivo cancelado por el usuario.");
    resetUploadControls(); // Resetea todo el estado de carga y recrea el input
  });

  // --- Lógica para eliminar duplicados ---

  const findDuplicatesById = () => {
    const seenIds = new Set();
    let hasDuplicates = false;
    programs.forEach((program) => {
      if (seenIds.has(program.id)) {
        hasDuplicates = true;
      } else {
        seenIds.add(program.id);
      }
    });
    return hasDuplicates;
  };

  const removeActualDuplicates = () => {
    if (
      confirm(
        "Esto eliminará todas las entradas duplicadas (manteniendo la primera que encuentre de cada ID). ¿Continuar?"
      )
    ) {
      const uniquePrograms = [];
      const seenIds = new Set();
      programs.forEach((program) => {
        if (!seenIds.has(program.id)) {
          uniquePrograms.push(program);
          seenIds.add(program.id);
        }
      });
      if (uniquePrograms.length < programs.length) {
        programs = uniquePrograms;
        savePrograms();
        renderPrograms();
        alert("Duplicados eliminados exitosamente.");
      } else {
        alert("No se encontraron duplicados para eliminar.");
      }
    }
  };

  if (removeDuplicatesButton) {
    removeDuplicatesButton.addEventListener("click", removeActualDuplicates);
  }

  const checkAndShowRemoveDuplicatesButton = () => {
    if (programs.length >= 2 && findDuplicatesById()) {
      removeDuplicatesButton.style.display = "inline-block";
    } else {
      removeDuplicatesButton.style.display = "none";
    }
  };

  // --- INICIALIZACIÓN ---
  // Al inicio, aseguramos que el botón amarillo y el de cancelar estén ocultos.
  // Y lo más importante, se crea el input de archivo inicial y se adjunta su listener.
  uploadDataButton.style.display = "none";
  uploadDataButton.textContent = originalUploadButtonText;
  cancelUploadFlowButton.style.display = "none";
  recreateFileInput(); // Llama a esta función al inicio para establecer el input inicial

  renderPrograms(); // Renderizar programas al inicio
});
