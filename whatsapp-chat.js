// WhatsApp Live Chat Widget
class WhatsAppChat {
  constructor(phoneNumber, defaultMessage = '') {
    this.phoneNumber = phoneNumber.replace(/[^0-9]/g, ''); // Clean phone number
    this.defaultMessage = defaultMessage;
    this.isOpen = false;
    this.init();
  }

  init() {
    this.createChatWidget();
    this.attachEventListeners();
  }

  createChatWidget() {
    // Create chat button
    const chatButton = document.createElement('div');
    chatButton.id = 'whatsapp-chat-button';
    chatButton.innerHTML = `
      <div class="chat-button-icon">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.594z"/>
        </svg>
      </div>
      <div class="chat-button-text">Chat with us</div>
    `;

    // Create chat popup
    const chatPopup = document.createElement('div');
    chatPopup.id = 'whatsapp-chat-popup';
    chatPopup.innerHTML = `
      <div class="chat-header">
        <div class="chat-header-info">
          <div class="chat-avatar">
            <div class="logo-icon">🪵</div>
          </div>
          <div class="chat-details">
            <h4>Wood & Whimsy</h4>
            <p class="chat-status">
              <span class="status-dot"></span>
              Typically replies instantly
            </p>
          </div>
        </div>
        <button class="chat-close" onclick="whatsappChat.toggleChat()">×</button>
      </div>
      <div class="chat-body">
        <div class="chat-message">
          <div class="message-avatar">
            <div class="logo-icon">🪵</div>
          </div>
          <div class="message-content">
            <p>Hi there! 👋</p>
            <p>How can we help you today? Whether you need furniture advice or want to know about our café menu, we're here to assist!</p>
          </div>
        </div>
      </div>
      <div class="chat-footer">
        <div class="chat-input-container">
          <input type="text" id="chat-message-input" placeholder="Type your message..." maxlength="500">
          <button class="chat-send-btn" onclick="whatsappChat.sendMessage()">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
        <div class="chat-powered">
          <small>Powered by WhatsApp</small>
        </div>
      </div>
    `;

    // Add to page
    document.body.appendChild(chatButton);
    document.body.appendChild(chatPopup);
  }

  attachEventListeners() {
    // Chat button click
    document.getElementById('whatsapp-chat-button').addEventListener('click', () => {
      this.toggleChat();
    });

    // Enter key in input
    document.getElementById('chat-message-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });

    // Close chat when clicking outside
    document.addEventListener('click', (e) => {
      const chatButton = document.getElementById('whatsapp-chat-button');
      const chatPopup = document.getElementById('whatsapp-chat-popup');
      
      if (this.isOpen && !chatButton.contains(e.target) && !chatPopup.contains(e.target)) {
        this.toggleChat();
      }
    });
  }

  toggleChat() {
    const chatButton = document.getElementById('whatsapp-chat-button');
    const chatPopup = document.getElementById('whatsapp-chat-popup');
    
    this.isOpen = !this.isOpen;
    
    if (this.isOpen) {
      chatButton.classList.add('chat-open');
      chatPopup.classList.add('chat-popup-open');
      document.getElementById('chat-message-input').focus();
    } else {
      chatButton.classList.remove('chat-open');
      chatPopup.classList.remove('chat-popup-open');
    }
  }

  sendMessage() {
    const input = document.getElementById('chat-message-input');
    const message = input.value.trim();
    
    if (message) {
      this.openWhatsApp(message);
      input.value = '';
    } else {
      this.openWhatsApp(this.defaultMessage);
    }
  }

  openWhatsApp(message = '') {
    const encodedMessage = encodeURIComponent(message || this.defaultMessage);
    const whatsappUrl = `https://wa.me/${this.phoneNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
    
    // Close chat popup
    this.isOpen = true; // Set to true so toggleChat will close it
    this.toggleChat();
  }
}

// Initialize WhatsApp chat when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Replace with your actual WhatsApp number (include country code, no + or spaces)
  const phoneNumber = '233256742431'; // Replace with your actual WhatsApp number
  const defaultMessage = 'Hi! I\'m interested in Wood & Whimsy furniture and café. Can you help me?';
  
  window.whatsappChat = new WhatsAppChat(phoneNumber, defaultMessage);
});
