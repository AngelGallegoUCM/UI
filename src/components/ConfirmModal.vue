<!-- ConfirmModal.vue -->
<template>
    <div v-if="isOpen" class="modal fade show d-block" tabindex="-1" role="dialog" style="background-color: rgba(0, 0, 0, 0.5);">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ title }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <p>{{ message }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-danger" @click="confirmAction">Confirmar</button>
            <button type="button" class="btn btn-secondary" @click="closeModal">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      title: {
        type: String,
        default: 'Confirmación',
      },
      message: {
        type: String,
        default: '¿Estás seguro de realizar esta acción?',
      },
    },
    data() {
      return {
        isOpen: false,
        confirmCallback: null,
      };
    },
    methods: {
      openModal(callback) {
        this.isOpen = true;
        this.confirmCallback = callback;
      },
      closeModal() {
        this.isOpen = false;
      },
      confirmAction() {
        if (this.confirmCallback) {
          this.confirmCallback();
        }
        this.closeModal();
      },
    },
  };
  </script>
  
  <style>
  .modal.fade.show {
    display: block;
  }
  </style>
  