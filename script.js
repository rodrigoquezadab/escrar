document.addEventListener("DOMContentLoaded", () => {
  // Elementos del formulario y lista
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

  // Elementos de acciones generales
  const downloadDataButton = document.getElementById("downloadDataButton");
  // CAMBIO: Ahora es un botón directo, no un label
  const uploadFileButton = document.getElementById("uploadFileButton");
  const removeDuplicatesButton = document.getElementById(
    "removeDuplicatesButton"
  );
  const cancelImportBtn = document.getElementById("cancelImportBtn");

  const fileUploadInput = document.getElementById("fileUpload");
  // CAMBIO: uploadFileInputContainer ya no existe en HTML
  // const uploadFileInputContainer = document.getElementById("uploadFileInputContainer");

  const importOptionsDiv = document.getElementById("importOptions");
  const importAddBtn = document.getElementById("importAddBtn");
  const importUpdateBtn = document.getElementById("importUpdateBtn");
  const importReplaceBtn = document.getElementById("importReplaceBtn");
  const loadBackupButton = document.getElementById("loadBackupButton");

  // Elementos del Modal
  const programModal = document.getElementById("programModal");
  const openAddProgramModalBtn = document.getElementById(
    "openAddProgramModalBtn"
  );
  const closeProgramModalBtn = document.getElementById("closeProgramModalBtn");

  // Botón para vaciar la lista
  const clearAllProgramsButton = document.getElementById(
    "clearAllProgramsButton"
  );

  // Elemento para el contador de programas
  const programCountSpan = document.getElementById("programCount");

  // Array para almacenar los programas
  let programs = [];
  let programsToImport = [];

  // --- FUNCIONES DE MODAL ---
  const openProgramModal = (isEdit = false, programData = null) => {
    programModal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden"); // Ocultar el scroll del body

    programForm.reset();

    if (isEdit && programData) {
      programIdInput.value = programData.id;
      nameInput.value = programData.name;
      versionInput.value = programData.version;
      usageInfoInput.value = programData.usageInfo;
      urlInput.value = programData.url;

      addButton.classList.add("hidden");
      updateButton.classList.remove("hidden");
      cancelButton.classList.remove("hidden");
    } else {
      programIdInput.value = "";
      addButton.classList.remove("hidden");
      updateButton.classList.add("hidden");
      cancelButton.classList.add("hidden");
    }
  };

  const closeProgramModal = () => {
    programModal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden"); // Volver a habilitar el scroll
    programForm.reset();
    cancelEdit();
  };

  // --- FUNCIONES DE ALMACENAMIENTO Y RENDERIZADO ---
  const savePrograms = () => {
    localStorage.setItem("programs", JSON.stringify(programs));
    checkAndShowRemoveDuplicatesButton();
    checkAndShowClearAllProgramsButton();
    updateProgramCount(); // Actualizar contador al guardar
  };

  const loadPrograms = () => {
    const storedPrograms = localStorage.getItem("programs");
    if (storedPrograms) {
      programs = JSON.parse(storedPrograms);
    }
    renderPrograms();
    checkAndShowRemoveDuplicatesButton();
    checkAndShowClearAllProgramsButton();
    updateProgramCount(); // Actualizar contador al cargar
  };

  const renderPrograms = () => {
    programsListDiv.innerHTML = "";
    const searchTerm = searchInput.value.toLowerCase();

    const filteredPrograms = programs.filter((program) => {
      return (
        program.name.toLowerCase().includes(searchTerm) ||
        program.version.toLowerCase().includes(searchTerm) ||
        program.usageInfo.toLowerCase().includes(searchTerm)
      );
    });

    if (filteredPrograms.length === 0) {
      programsListDiv.innerHTML =
        "<p class='text-center text-gray-500'>No hay programas guardados o no se encontraron resultados.</p>";
    }

    filteredPrograms.forEach((program) => {
      const programItem = document.createElement("div");
      programItem.className =
        "program-item bg-white p-4 rounded-lg shadow-md flex justify-between items-center";
      programItem.innerHTML = `
        <div>
          <h3 class="text-lg font-bold text-gray-800">${
            program.name
          } <span class="text-gray-500 text-sm">(${program.version})</span></h3>
          <p class="text-gray-600 text-sm mt-1">${program.usageInfo}</p>
          ${
            program.url
              ? `<a href="${program.url}" target="_blank" class="text-blue-500 hover:underline text-sm mt-1 block">Ir al sitio web</a>`
              : ""
          }
        </div>
        <div class="flex space-x-2 mt-2 md:mt-0">
          <button data-id="${
            program.id
          }" class="edit-btn bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-3 rounded text-xs transition duration-200 ease-in-out">Editar</button>
          <button data-id="${
            program.id
          }" class="delete-btn bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-xs transition duration-200 ease-in-out">Eliminar</button>
        </div>
      `;
      programsListDiv.appendChild(programItem);
    });

    document.querySelectorAll(".edit-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        const idToEdit = e.target.dataset.id;
        const programToEdit = programs.find(
          (program) => program.id === idToEdit
        );
        if (programToEdit) {
          openProgramModal(true, programToEdit);
        }
      });
    });
    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", deleteProgram);
    });

    checkAndShowClearAllProgramsButton();
  };

  // --- CRUD DE PROGRAMAS ---
  const generateId = () => {
    return "_" + Math.random().toString(36).substr(2, 9);
  };

  const addProgram = (e) => {
    e.preventDefault();
    const newProgram = {
      id: generateId(),
      name: nameInput.value,
      version: versionInput.value,
      usageInfo: usageInfoInput.value,
      url: urlInput.value,
    };
    programs.push(newProgram);
    savePrograms();
    renderPrograms();
    closeProgramModal();
  };

  const updateProgram = () => {
    const idToUpdate = programIdInput.value;
    const programIndex = programs.findIndex(
      (program) => program.id === idToUpdate
    );

    if (programIndex > -1) {
      programs[programIndex] = {
        id: idToUpdate,
        name: nameInput.value,
        version: versionInput.value,
        usageInfo: usageInfoInput.value,
        url: urlInput.value,
      };
      savePrograms();
      renderPrograms();
      closeProgramModal();
    }
  };

  const deleteProgram = (e) => {
    if (confirm("¿Estás seguro de que quieres eliminar este programa?")) {
      const idToDelete = e.target.dataset.id;
      programs = programs.filter((program) => program.id !== idToDelete);
      savePrograms();
      renderPrograms();
    }
  };

  const cancelEdit = () => {
    programForm.reset();
    programIdInput.value = "";
    addButton.classList.remove("hidden");
    updateButton.classList.add("hidden");
    cancelButton.classList.add("hidden");
  };

  // --- FUNCIONES DE BÚSQUEDA ---
  searchInput.addEventListener("keyup", renderPrograms);

  // --- FUNCIONES DE EXPORTACIÓN/IMPORTACIÓN ---
  const downloadData = () => {
    const dataStr = JSON.stringify(programs, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "programas.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        programsToImport = JSON.parse(e.target.result);
        if (Array.isArray(programsToImport)) {
          showImportOptions();
        } else {
          alert("El archivo JSON no contiene un array de programas válido.");
          resetUploadFlow();
        }
      } catch (error) {
        alert("Error al leer el archivo JSON: " + error.message);
        resetUploadFlow();
      }
    };
    reader.readAsText(file);
  };

  const loadBackupData = async () => {
    if (
      !confirm(
        "¿Estás seguro de que quieres cargar los datos de respaldo? Esto abrirá las opciones de importación."
      )
    ) {
      return;
    }
    try {
      const response = await fetch("programas_bkup.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      programsToImport = await response.json();
      if (Array.isArray(programsToImport)) {
        showImportOptions();
      } else {
        alert("El archivo programas_bkup.json no contiene un array válido.");
        resetUploadFlow();
      }
    } catch (error) {
      alert("Error al cargar programas_bkup.json: " + error.message);
      resetUploadFlow();
    }
  };

  const showImportOptions = () => {
    importOptionsDiv.classList.remove("hidden");
    // CAMBIO: Ocultamos el botón de carga de archivo ahora
    uploadFileButton.classList.add("hidden");
    // uploadFileInputContainer ya no existe
    downloadDataButton.classList.add("hidden");
    loadBackupButton.classList.add("hidden");
  };

  const resetUploadFlow = () => {
    importOptionsDiv.classList.add("hidden");
    programsToImport = [];
    // CAMBIO: Mostramos el botón de carga de archivo
    uploadFileButton.classList.remove("hidden");
    // uploadFileInputContainer ya no existe
    fileUploadInput.value = "";
    downloadDataButton.classList.remove("hidden");
    loadBackupButton.classList.remove("hidden");
    checkAndShowRemoveDuplicatesButton();
    checkAndShowClearAllProgramsButton();
    updateProgramCount(); // Actualizar contador al resetear el flujo
  };

  const importData = (type) => {
    if (programsToImport.length === 0) {
      alert("No hay datos para importar.");
      resetUploadFlow();
      return;
    }

    if (
      !confirm(
        `¿Estás seguro de que quieres realizar esta operación de importación (${type})?`
      )
    ) {
      return;
    }

    switch (type) {
      case "add":
        programsToImport.forEach((newProgram) => {
          if (!programs.some((existing) => existing.id === newProgram.id)) {
            programs.push(newProgram);
          }
        });
        break;
      case "update":
        programsToImport.forEach((newProgram) => {
          const existingIndex = programs.findIndex(
            (existing) => existing.id === newProgram.id
          );
          if (existingIndex > -1) {
            programs[existingIndex] = newProgram;
          } else {
            programs.push(newProgram);
          }
        });
        break;
      case "replace":
        programs = programsToImport;
        break;
      default:
        console.warn("Tipo de importación desconocido:", type);
        break;
    }

    savePrograms();
    renderPrograms();
    alert(`Importación '${type}' completada exitosamente.`);
    resetUploadFlow();
  };

  // --- FUNCIONES DE MANEJO DE DUPLICADOS ---
  const findDuplicatesById = () => {
    const seenIds = new Set();
    for (const program of programs) {
      if (seenIds.has(program.id)) {
        return true;
      }
      seenIds.add(program.id);
    }
    return false;
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

  const checkAndShowRemoveDuplicatesButton = () => {
    if (programs.length >= 2 && findDuplicatesById()) {
      removeDuplicatesButton.style.display = "inline-block";
    } else {
      removeDuplicatesButton.style.display = "none";
    }
  };

  // Función para vaciar todos los programas
  const clearAllPrograms = () => {
    if (
      confirm(
        "¿Estás seguro de que quieres eliminar TODOS los programas de la lista? Esta acción es irreversible."
      )
    ) {
      programs = []; // Vaciar el array de programas
      savePrograms(); // Guardar el estado vacío
      renderPrograms(); // Volver a renderizar la lista (ahora vacía)
      alert("Todos los programas han sido eliminados.");
    }
  };

  // Función para controlar la visibilidad del botón "Vaciar Lista"
  const checkAndShowClearAllProgramsButton = () => {
    if (programs.length > 0) {
      clearAllProgramsButton.style.display = "inline-block";
    } else {
      clearAllProgramsButton.style.display = "none";
    }
  };

  // Función para actualizar el contador de programas
  const updateProgramCount = () => {
    programCountSpan.textContent = programs.length;
  };

  // --- EVENT LISTENERS ---
  openAddProgramModalBtn.addEventListener("click", () =>
    openProgramModal(false)
  );
  closeProgramModalBtn.addEventListener("click", closeProgramModal);

  programModal.addEventListener("click", (e) => {
    if (e.target === programModal) {
      closeProgramModal();
    }
  });

  programForm.addEventListener("submit", addProgram);
  updateButton.addEventListener("click", updateProgram);
  cancelButton.addEventListener("click", closeProgramModal);

  downloadDataButton.addEventListener("click", downloadData);

  // CAMBIO: Listener para el nuevo botón de carga de archivo
  uploadFileButton.addEventListener("click", () => {
    fileUploadInput.click(); // Simula un clic en el input de tipo file oculto
  });
  // El listener para el 'change' del input de archivo sigue siendo el mismo
  fileUploadInput.addEventListener("change", handleFileUpload);

  loadBackupButton.addEventListener("click", loadBackupData);

  importAddBtn.addEventListener("click", () => importData("add"));
  importUpdateBtn.addEventListener("click", () => importData("update"));
  importReplaceBtn.addEventListener("click", () => importData("replace"));
  cancelImportBtn.addEventListener("click", resetUploadFlow);

  if (removeDuplicatesButton) {
    removeDuplicatesButton.addEventListener("click", removeActualDuplicates);
  }

  if (clearAllProgramsButton) {
    clearAllProgramsButton.addEventListener("click", clearAllPrograms);
  }

  // --- INICIALIZACIÓN ---
  loadPrograms();
});
