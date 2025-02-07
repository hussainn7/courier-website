import React, { useEffect, useState } from 'react';
import './Calculator.css';

function Calculator() {
  const ratePerKm = 450; // Стоимость за км
  const [formData, setFormData] = useState({
    fio: '',
    phone: '',
    email: '',
    address1: '',
    address2: '',
    distance: '',
    cost: ''
  });
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadYandexMaps = async () => {
      setIsLoading(true);
      try {
        // Check if script is already loaded
        if (window.ymaps) {
          window.ymaps.ready(init);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://api-maps.yandex.ru/2.1/?apikey=2e1510a2-a865-4d6e-aae3-839289d6bf95&lang=ru_RU';
        script.async = true;
        
        // Add error handling for script load failure
        script.onerror = () => {
          console.error('Failed to load Yandex Maps script');
        };

        script.onload = () => {
          if (window.ymaps) {
            window.ymaps.ready(init);
          }
        };

        document.body.appendChild(script);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadYandexMaps();

    return () => {
      // Cleanup
      const script = document.querySelector('script[src*="api-maps.yandex.ru"]');
      if (script) {
        script.remove();
      }
      if (window.mapInstance) {
        window.mapInstance.destroy();
        window.mapInstance = null;
      }
    };
  }, []);

  useEffect(() => {
    // Load previous submissions from localStorage
    const savedSubmissions = localStorage.getItem('orderSubmissions');
    if (savedSubmissions) {
      setSubmissions(JSON.parse(savedSubmissions));
    }
  }, []);

  function init() {
    try {
      if (window.mapInstance) {
        window.mapInstance.destroy();
      }

      let points = [];
      let placemarks = [];
      let distance = 0;

      const myMap = new window.ymaps.Map('map', {
        center: [55.76, 37.64],
        zoom: 10
      });

      // Store map instance globally for cleanup
      window.mapInstance = myMap;

      myMap.events.add('click', function (e) {
        const coords = e.get('coords');
        if (placemarks.length >= 2) {
          placemarks.forEach(placemark => myMap.geoObjects.remove(placemark));
          points = [];
          placemarks = [];
        }
        addPlacemark(coords);
      });

      function addPlacemark(coords) {
        const placemark = new window.ymaps.Placemark(coords, {}, {
          preset: 'islands#blueIcon',
          draggable: true
        });

        placemark.events.add('click', function () {
          myMap.geoObjects.remove(this);
          points.splice(placemarks.indexOf(this), 1);
          placemarks.splice(placemarks.indexOf(this), 1);
          updateResults();
        });

        placemark.events.add('dragend', function () {
          points[placemarks.indexOf(this)] = this.geometry.getCoordinates();
          updateResults();
        });

        myMap.geoObjects.add(placemark);
        points.push(coords);
        placemarks.push(placemark);

        // Get and show address immediately when point is added
        window.ymaps.geocode(coords).then(function (res) {
          const addressElement = document.getElementById(`address${points.length}`);
          if (addressElement) {
            addressElement.textContent = res.geoObjects.get(0).getAddressLine();
          }
        });

        updateResults();
      }

      function updateResults() {
        const distanceElement = document.getElementById('distance');
        const costElement = document.getElementById('cost');
        const address1Element = document.getElementById('address1');
        const address2Element = document.getElementById('address2');

        if (points.length === 2) {
          distance = window.ymaps.coordSystem.geo.getDistance(points[0], points[1]);
          const distanceInKm = distance / 1000;
          distanceElement.textContent = `${Math.round(distance)} м (${distanceInKm.toFixed(2)} км)`;
          costElement.textContent = (distanceInKm * ratePerKm).toFixed(2)+ "₽";

          points.forEach((point, index) => {
            window.ymaps.geocode(point).then(function (res) {
              const addressElement = document.getElementById(`address${index + 1}`);
              if (addressElement) {
                addressElement.textContent = res.geoObjects.get(0).getAddressLine();
              }
            });
          });

          setFormData({
            fio: '',
            phone: '',
            email: '',
            address1: document.getElementById('address1').textContent,
            address2: document.getElementById('address2').textContent,
            distance: distanceElement.textContent,
            cost: costElement.textContent
          });
        } else {
          distanceElement.textContent = '0 м (0 км)';
          costElement.textContent = '0₽';
          address1Element.textContent = '';
          address2Element.textContent = '';
          distance = 0;
          setFormData({
            fio: '',
            phone: '',
            email: '',
            address1: '',
            address2: '',
            distance: '',
            cost: ''
          });
        }
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newSubmission = {
      id: Date.now(),
      fio: formData.fio,
      phone: formData.phone,
      email: formData.email,
      address1: document.getElementById('address1').textContent,
      address2: document.getElementById('address2').textContent,
      distance: document.getElementById('distance').textContent,
      cost: document.getElementById('cost').textContent,
      timestamp: new Date().toLocaleString()
    };

    // Add to submissions array
    const updatedSubmissions = [...submissions, newSubmission];
    setSubmissions(updatedSubmissions);
    
    // Save to localStorage
    localStorage.setItem('orderSubmissions', JSON.stringify(updatedSubmissions));

    alert('Заявка успешно сохранена!');
    setFormData({
      fio: '',
      phone: '',
      email: '',
      address1: '',
      address2: '',
      distance: '',
      cost: ''
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Загрузка карты...
      </div>
    );
  }

  return (
    <div className="calculator-container">
      <div className="calculator-header">
        <h2>Калькулятор стоимости доставки</h2>
      </div>
      
      <div className="calculator-content">
        <div className="map-section">
          <div className="map-container">
            <div id="map"></div>
          </div>
          
          <div className="results-display">
            <div className="result-item">
              <h3>Расстояние:</h3>
              <span id="distance">0 м</span>
            </div>
            <div className="result-item">
              <h3>Стоимость:</h3>
              <span id="cost">0 ₽</span>
            </div>
            <div className="result-item">
              <h3>Точка А:</h3>
              <span id="address1"></span>
            </div>
            <div className="result-item">
              <h3>Точка Б:</h3>
              <span id="address2"></span>
            </div>
          </div>
        </div>

        <div className="form-section">
          <form onSubmit={handleSubmit} className="order-form">
            <h3>Оформление заказа</h3>
            
            <div className="form-group">
              <label htmlFor="fio">ФИО:</label>
              <input
                type="text"
                id="fio"
                name="fio"
                value={formData.fio}
                onChange={handleInputChange}
                required
                placeholder="Введите ваше ФИО"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Телефон:</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="+7 (___) ___-__-__"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="example@email.com"
              />
            </div>

            <button type="submit" className="submit-button">
              Отправить заявку
            </button>
          </form>
        </div>

        <div className="submissions-section">
          <h3>Последние заявки</h3>
          <div className="submissions-list">
            {submissions.map(submission => (
              <div key={submission.id} className="submission-item">
                <p><strong>ФИО:</strong> {submission.fio}</p>
                <p><strong>Телефон:</strong> {submission.phone}</p>
                <p><strong>Email:</strong> {submission.email}</p>
                <p><strong>От:</strong> {submission.address1}</p>
                <p><strong>До:</strong> {submission.address2}</p>
                <p><strong>Расстояние:</strong> {submission.distance}</p>
                <p><strong>Стоимость:</strong> {submission.cost}</p>
                <p><strong>Время:</strong> {submission.timestamp}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Calculator; 