/*
 * MedIoT — ESP8266 RFID scan
 *
 * Envia userUid (cartão) + productUid (tag do produto) para:
 *   POST http://<IP-DO-PC>:43123/api/rfid/scan
 *
 * Configure WIFI_SSID, WIFI_PASSWORD e API_HOST antes de gravar.
 * Não use 127.0.0.1 no ESP — use o IP LAN do computador (ex.: 192.168.0.10).
 *
 * Bibliotecas: ESP8266WiFi, ESP8266HTTPClient, ArduinoJson
 * (MFRC522 opcional — abaixo há placeholders para UIDs lidos.)
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>

const char* WIFI_SSID = "SUA_REDE";
const char* WIFI_PASSWORD = "SUA_SENHA";

// IP do PC que roda o Next.js (npm run dev na porta 43123)
const char* API_HOST = "192.168.0.10";
const uint16_t API_PORT = 43123;
const char* API_PATH = "/api/rfid/scan";

void connectWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Conectando Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(400);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("IP do ESP: ");
  Serial.println(WiFi.localIP());
}

bool postRfidScan(const String& userUid, const String& productUid) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Wi-Fi desconectado");
    return false;
  }

  WiFiClient client;
  HTTPClient http;
  String url = String("http://") + API_HOST + ":" + API_PORT + API_PATH;

  if (!http.begin(client, url)) {
    Serial.println("Falha ao iniciar HTTP");
    return false;
  }

  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<256> body;
  body["userUid"] = userUid;
  body["productUid"] = productUid;

  String payload;
  serializeJson(body, payload);

  Serial.print("POST ");
  Serial.println(url);
  Serial.println(payload);

  int code = http.POST(payload);
  String response = http.getString();
  http.end();

  Serial.print("HTTP ");
  Serial.println(code);
  Serial.println(response);

  if (code == 201) {
    StaticJsonDocument<512> doc;
    if (!deserializeJson(doc, response)) {
      const char* action = doc["action"] | "";
      Serial.print("OK action=");
      Serial.println(action);
    }
    return true;
  }

  return false;
}

void setup() {
  Serial.begin(115200);
  delay(500);
  connectWifi();

  // Exemplo com UIDs do seed MedIoT (substitua pelos UIDs reais do MFRC522):
  // User A = CARD-8841 (João), Produto = TAG-LUV-M-01 (Luva M)
  postRfidScan("CARD-8841", "TAG-LUV-M-01");
}

void loop() {
  // Quando integrar o leitor:
  // 1) Ler cartão do funcionário -> userUid
  // 2) Ler tag do produto -> productUid
  // 3) postRfidScan(userUid, productUid)
  delay(2000);
}
