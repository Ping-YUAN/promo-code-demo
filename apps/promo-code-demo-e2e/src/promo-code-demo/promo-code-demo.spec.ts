import axios from 'axios';

describe('GET /api', () => {
  it('should return a message', async () => {
    const res = await axios.get(`/api`);

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ message: 'Hello API' });
  });

  it('should get empty promo a message', async () => {
    const res = await axios.get(`api/promo-management`);

    expect(res.status).toBe(200);
    expect(res.data).toEqual([]);
  });


  it('should add a new promo a message', async () => {
    const res = await axios.post(`api/promo-management`, {
      "name": "WeatherCode",
      "avantage": { "percent": 20 },
      "restrictions": [
        {
          "@date": {
            "after": "2019-01-01",
            "before": "2024-06-30"
          }
        },
        {
          "@or": [
            {
              "@age": {
                "eq": 40
              }
            },
            {
              "@and": [
                {
                  "@age": {
                    "lt": 30,
                    "gt": 15
                  }
                },
                {
                  "@meteo": {
                    "is": "clear",
                    "temp": {
                      "gt": "15" // Celsius here.
                    }
                  }
                }
              ]
            }
          ]
        }
      ]
    });

    expect(res.status).toBe(201);
    expect(res.data.status).toEqual('accepted');
  });

  it('should get a deniy ', async () => {
    const validDeniedReq = await axios.post('api/promo-valid', {
      "promocode_name": "WeatherCode",
      "arguments": {
        "age": 15,
        "meteo": { "town": "Lyon" }
      }
    });

    expect(validDeniedReq.status).toBe(201); 
    expect(validDeniedReq.data.status).toBe('denied');

  })

  it('should get an accepted ', async () => {
    const validAcceptedReq = await axios.post('api/promo-valid', {
      "promocode_name": "WeatherCode",
      "arguments": {
        "age": 25,
        "meteo": { "town": "Lyon" }
      }
    });

    expect(validAcceptedReq.status).toBe(201); 
    expect(validAcceptedReq.data.status).toBe('accepted')
  })
});
