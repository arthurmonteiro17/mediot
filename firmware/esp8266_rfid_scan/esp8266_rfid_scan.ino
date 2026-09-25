/*
 * MedIoT — ESP8266 RFID scan (produção: mediot.online)
 *
 * Envia userUid (cartão) + productUid (tag do produto) para:
 *   POST https://mediot.online/api/rfid/scan
 *
 * Configure WIFI_SSID e WIFI_PASSWORD antes de gravar.
 *
 * Bibliotecas: ESP8266WiFi, ESP8266HTTPClient, ArduinoJson
 * (MFRC522 opcional — abaixo há placeholders para UIDs lidos.)
 *
 * Dev local (sem HTTPS): defina USE_HTTPS 0 e API_HOST = "192.168.x.x"
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecureBearSSL.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>

const char* WIFI_SSID = "SUA_REDE";
const char* WIFI_PASSWORD = "SUA_SENHA";

// Produção VPS + domínio (deixe USE_HTTPS 1)
#define USE_HTTPS 1
const char* API_HOST = "mediot.online";
const uint16_t API_PORT = 443;
const char* API_PATH = "/api/rfid/scan";

// Em placas com pouca RAM, setInsecure() evita validar a CA do Cloudflare.
// Para produção escolar/demo é aceitável; em ambiente crítico use fingerprint/CA.
const bool TLS_INSECURE = true;

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

  HTTPClient http;
  String url;

#if USE_HTTPS
  std::unique_ptr<BearSSL::WiFiClientSecure> client(new BearSSL::WiFiClientSecure);
  if (TLS_INSECURE) {
    client->setInsecure();
  }
  url = String("https://") + API_HOST + API_PATH;
  if (!http.begin(*client, url)) {
    Serial.println("Falha ao iniciar HTTPS");
    return false;
  }
#else
  WiFiClient client;
  url = String("http://") + API_HOST + ":" + API_PORT + API_PATH;
  if (!http.begin(client, url)) {
    Serial.println("Falha ao iniciar HTTP");
    return false;
  }
#endif

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

  // Exemplo com UIDs reais do MedIoT (substitua pelos lidos no MFRC522 se diferente):
  // Arthur = 67:52:B0:A0, Furadeira = F5:76:82:B1
  postRfidScan("67:52:B0:A0", "F5:76:82:B1");
}

void loop() {
  // Quando integrar o leitor:
  // 1) Ler cartão do funcionário -> userUid
  // 2) Ler tag do produto -> productUid
  // 3) postRfidScan(userUid, productUid)
  delay(2000);
}
