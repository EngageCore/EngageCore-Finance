/**
 * Message Templates Service
 * Provides predefined message templates for quick replies
 */
class MessageTemplates {
  constructor() {
    this.templates = [
      {
        id: 1,
        name: "Welcome",
        text: "Welcome to our support chat! How can I assist you today?"
      },
      {
        id: 2,
        name: "Thank You",
        text: "Thank you for contacting us. Is there anything else I can help you with?"
      },
      {
        id: 3,
        name: "Goodbye",
        text: "Thank you for chatting with us. Have a great day!"
      },
      {
        id: 4,
        name: "Technical Issue",
        text: "I understand you're experiencing a technical issue. Could you please provide more details so I can better assist you?"
      },
      {
        id: 5,
        name: "Wait a Moment",
        text: "Please give me a moment to check that for you."
      },
      {
        id: 6,
        name: "Contact Information",
        text: "For further assistance, you can reach our support team at support@example.com or call us at +1-234-567-8900."
      },
      {
        id: 7,
        name: "Follow Up",
        text: "I'll follow up with you on this issue within 24 hours."
      },
      {
        id: 8,
        name: "Apology",
        text: "I apologize for the inconvenience this has caused. We're working to resolve this as quickly as possible."
      }
    ];
  }

  /**
   * Get all available templates
   * @returns {Array} List of message templates
   */
  getTemplates() {
    return this.templates;
  }

  /**
   * Get a template by ID
   * @param {number} id Template ID
   * @returns {Object|null} Template object or null if not found
   */
  getTemplateById(id) {
    return this.templates.find(template => template.id === id) || null;
  }

  /**
   * Add a new template
   * @param {string} name Template name
   * @param {string} text Template text
   * @returns {Object} Newly created template
   */
  addTemplate(name, text) {
    const newId = Math.max(...this.templates.map(t => t.id), 0) + 1;
    const newTemplate = {
      id: newId,
      name,
      text
    };
    
    this.templates.push(newTemplate);
    return newTemplate;
  }

  /**
   * Update an existing template
   * @param {number} id Template ID
   * @param {Object} updates Updates to apply
   * @returns {Object|null} Updated template or null if not found
   */
  updateTemplate(id, updates) {
    const index = this.templates.findIndex(template => template.id === id);
    if (index === -1) return null;
    
    this.templates[index] = { ...this.templates[index], ...updates };
    return this.templates[index];
  }

  /**
   * Delete a template
   * @param {number} id Template ID
   * @returns {boolean} Success status
   */
  deleteTemplate(id) {
    const index = this.templates.findIndex(template => template.id === id);
    if (index === -1) return false;
    
    this.templates.splice(index, 1);
    return true;
  }
}

// Create and export a singleton instance
const messageTemplates = new MessageTemplates();
export default messageTemplates;