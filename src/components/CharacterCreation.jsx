import { useState } from 'react';
import '../styles/CharacterCreation.css';

export default function CharacterCreation({ onComplete }) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('male');
  const [skinTone, setSkinTone] = useState('light');
  const [hairStyle, setHairStyle] = useState('short');
  const [outfit, setOutfit] = useState('casual');
  const [avatarBase64, setAvatarBase64] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 2MB to avoid localStorage quota issues)
      if (file.size > 2 * 1024 * 1024) {
        alert('Vui lòng chọn ảnh có dung lượng nhỏ hơn 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim().length === 0) {
      alert('Vui lòng nhập tên của bạn!');
      return;
    }
    onComplete({ name, gender, skinTone, hairStyle, outfit, customAvatar: avatarBase64 });
  };

  return (
    <div className="char-creation-screen">
      <div className="char-creation-card dark-fantasy">
        <h2>Tạo Nhân Vật</h2>
        <p className="subtitle">Hành trình khám phá lâu đài bóng rối...</p>

        <form onSubmit={handleSubmit} className="char-form-scroll">
          
          <div className="avatar-upload-container">
            <div className="avatar-preview">
              {avatarBase64 ? (
                <img src={avatarBase64} alt="Avatar Preview" />
              ) : (
                <div className="avatar-placeholder">👤</div>
              )}
            </div>
            <label className="upload-btn">
              Tải ảnh lên (Tùy chọn)
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
          </div>

          <div className="input-group">
            <label>Tên pháp sư:</label>
            <input
              type="text"
              placeholder="Nhập tên nhân vật..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              className="name-input"
            />
          </div>

          <div className="input-group">
            <label>Giới tính</label>
            <div className="selection-grid">
              <div
                className={"selection-card " + (gender === 'male' ? 'selected' : '')}
                onClick={() => setGender('male')}
              >
                <div className="selection-icon">👦</div>
                <span>Nam</span>
              </div>
              <div
                className={"selection-card " + (gender === 'female' ? 'selected' : '')}
                onClick={() => setGender('female')}
              >
                <div className="selection-icon">👧</div>
                <span>Nữ</span>
              </div>
            </div>
          </div>

          <div className="input-group">
            <label>Màu da</label>
            <div className="selection-grid">
              <div
                className={"selection-card " + (skinTone === 'light' ? 'selected' : '')}
                onClick={() => setSkinTone('light')}
              >
                <div className="selection-color" style={{background: '#ffe0bd'}}></div>
                <span>Sáng</span>
              </div>
              <div
                className={"selection-card " + (skinTone === 'medium' ? 'selected' : '')}
                onClick={() => setSkinTone('medium')}
              >
                <div className="selection-color" style={{background: '#f1c27d'}}></div>
                <span>Trung tính</span>
              </div>
              <div
                className={"selection-card " + (skinTone === 'dark' ? 'selected' : '')}
                onClick={() => setSkinTone('dark')}
              >
                <div className="selection-color" style={{background: '#8d5524'}}></div>
                <span>Tối</span>
              </div>
            </div>
          </div>

          <button type="submit" className="confirm-btn" disabled={!name}>
            Bắt Đầu Cuộc Hành Trình 🗡️
          </button>
        </form>
      </div>
    </div>
  );
}
