import React, { useState } from 'react'
import '../styles/ShopScreen.css'

export default function ShopScreen({ playerProfile, updateProfile, onBack }) {  
  const [activeCategory, setActiveCategory] = useState('outfits')

  // MOCK DATA for Shop
  const shopItems = {
    outfits: [
      { id: 'default', name: 'Đồng phục gốc', price: 0, type: 'outfit', img: '/kitty.jpg' },
      { id: 'winter', name: 'Áo khoác mùa đông', price: 100, type: 'outfit', img: '/kitty.jpg' },
      { id: 'summer', name: 'Váy đi biển', price: 150, type: 'outfit', img: '/kitty.jpg' }
    ],
    backgrounds: [
      { id: 'default', name: 'Trường học', price: 0, type: 'background', img: '/background.png' },
      { id: 'cafe', name: 'Quán Cafe', price: 80, type: 'background', img: '/background.png' },
      { id: 'park', name: 'Công viên', price: 120, type: 'background', img: '/background.png' }
    ]
  }

  const items = shopItems[activeCategory]

  const handleBuyOrEquip = (item) => {
    const isOwned = playerProfile.inventory[activeCategory].includes(item.id)   
    const isEquipped = playerProfile.equipped[activeCategory === 'outfits' ? 'outfit' : 'background'] === item.id                                               
    
    if (isEquipped) {
      alert("Bạn đang sử dụng món đồ này rồi!")
      return
    }

    if (isOwned) {
      // Equip
      updateProfile({
        equipped: {
          ...playerProfile.equipped,
          [activeCategory === 'outfits' ? 'outfit' : 'background']: item.id     
        }
      })
      alert(`Đã trang bị ${item.name}!`)
    } else {
      // Buy
      if (playerProfile.gold >= item.price) {
        if (window.confirm(`Bạn có chắc muốn mua ${item.name} với giá ${item.price} Vàng?`)) {
          updateProfile({
            gold: playerProfile.gold - item.price,
            inventory: {
              ...playerProfile.inventory,
              [activeCategory]: [...playerProfile.inventory[activeCategory], item.id]
            }
          })
          alert("Mua thành công!")
        }
      } else {
        alert("Bạn không đủ Vàng!")
      }
    }
  }

  return (
    <div className="shop-screen">
      <div className="shop-header">
        <button className="back-btn" onClick={onBack}>⬅ Trở về</button>
        <div className="shop-gold">💰 {playerProfile.gold} Vàng</div>
      </div>

      <div className="shop-container">
        <h1 className="shop-title">Cửa Hàng (Gacha & Shop)</h1>
        <div className="shop-tabs">
          <button
            className={`shop-tab ${activeCategory === 'outfits' ? 'active' : ''}`}
            onClick={() => setActiveCategory('outfits')}
          >
            👗 Trang Phục
          </button>
          <button
            className={`shop-tab ${activeCategory === 'backgrounds' ? 'active' : ''}`}
            onClick={() => setActiveCategory('backgrounds')}
          >
            🖼️ Phông Nền
          </button>
        </div>

        <div className="shop-grid">
          {items.map(item => {
            const isOwned = playerProfile.inventory[activeCategory].includes(item.id)
            const isEquipped = playerProfile.equipped[activeCategory === 'outfits' ? 'outfit' : 'background'] === item.id                                       
            return (
              <div key={item.id} className={`shop-item-card ${isEquipped ? 'equipped-card' : ''}`}>
                <div className="item-img-placeholder">Image<br/>({item.name})</div>
                <h3 className="item-name">{item.name}</h3>
                <div className="item-status">
                  {isEquipped ? (
                     <span className="status-badge equipped">Đang mặc</span>    
                  ) : isOwned ? (
                     <span className="status-badge owned">Đã sở hữu</span>      
                  ) : (
                     <span className="item-price">💰 {item.price} Vàng</span>   
                  )}
                </div>
                <button
                  className={`action-btn ${isEquipped ? 'btn-equipped' : isOwned ? 'btn-equip' : 'btn-buy'}`}
                  onClick={() => handleBuyOrEquip(item)}
                >
                  {isEquipped ? 'Đang dùng' : isOwned ? 'Trang bị' : 'Mua ngay'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
