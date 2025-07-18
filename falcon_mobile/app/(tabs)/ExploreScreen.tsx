import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  StyleSheet,
  View,
  Text,
  ScrollView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import { getServerIP } from '../../utils/getServerIP';

const IP_NODEMCU = getServerIP();

export default function ExploreScreen() {
  const [dadoSerial, setDadoSerial] = useState<string>('---');
  const [htmlContent, setHtmlContent] = useState<string | null>(null);

  const enviarComando = async (comando: 'ligar' | 'desligar') => {
    const dados = {
      comando,
      origem: 'Falcon Mobile',
      timestamp: new Date().toISOString(),
    };

    try {
      const resposta = await fetch(`${IP_NODEMCU}/api/comando`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });

      const contentType = resposta.headers.get('content-type') || '';
      const texto = await resposta.text();

      if (!resposta.ok) {
        throw new Error(`Erro HTTP: ${resposta.status}\nConteúdo: ${texto}`);
      }

      if (contentType.includes('application/json')) {
        const resultado = JSON.parse(texto);
        Alert.alert('Resposta da Vespa (ESP32)', JSON.stringify(resultado, null, 2));
        setHtmlContent(null); // Limpa qualquer HTML anterior
      } else {
        // É HTML ou texto plano
        setHtmlContent(texto);
        await salvarArquivoHTML(texto);
        await enviarHTMLParaAPI(texto); // opcional
        Alert.alert('Resposta (não-JSON)', texto);
      }

    } catch (erro) {
      Alert.alert('Erro de comunicação', (erro as Error).message);
    }
  };

  const salvarArquivoHTML = async (html: string) => {
    const path = FileSystem.documentDirectory + 'resposta_vespa.html';
    try {
      await FileSystem.writeAsStringAsync(path, html, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      console.log('📄 Arquivo HTML salvo em:', path);
    } catch (err) {
      console.warn('⚠️ Erro ao salvar HTML:', err);
    }
  };

  const enviarHTMLParaAPI = async (html: string) => {
    try {
      await fetch('https://sua-api.com/receber-html', {
        method: 'POST',
        headers: { 'Content-Type': 'text/html' },
        body: html,
      });
      console.log('✅ HTML enviado à API com sucesso.');
    } catch (err) {
      console.warn('⚠️ Erro ao enviar HTML para API:', err);
    }
  };

  const buscarDadoSerial = async () => {
    try {
      const resposta = await fetch(`${IP_NODEMCU}/api/dados_vespa`);
      const contentType = resposta.headers.get('content-type') || '';
      const texto = await resposta.text();

      if (!resposta.ok) {
        throw new Error(`Erro HTTP ${resposta.status} (${resposta.statusText})\n${texto}`);
      }

      if (contentType.includes('application/json')) {
        const json = JSON.parse(texto);
        setDadoSerial(json.dado || 'Sem dado');
        setHtmlContent(null);
      } else {
        const htmlMatch = texto.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        const htmlExtraido = htmlMatch ? htmlMatch[1] : texto;

        setDadoSerial('Conteúdo HTML recebido');
        setHtmlContent(texto);
        await salvarArquivoHTML(texto);
        // await enviarHTMLParaAPI(texto); // opcional
      }
    } catch (err) {
      setDadoSerial(
        'Erro ao buscar dado: ' +
          (err instanceof Error ? err.message : 'Erro desconhecido')
      );
      setHtmlContent(null);
    }
  };

  useEffect(() => {
    const intervalo = setInterval(buscarDadoSerial, 5000); // a cada 5 segundos
    return () => clearInterval(intervalo);
  }, []);

  return (
    <ScrollView style={styles.scroll}>
      <View style={styles.container}>
        <Text style={styles.ipText}>Conectando a: {IP_NODEMCU}</Text>
        <Text style={styles.serialText}>Dado da Vespa: {dadoSerial}</Text>

        {htmlContent && (
          <>
            <Text style={styles.htmlPreviewTitle}>Prévia do HTML:</Text>
            <View style={styles.webviewContainer}>
              <WebView
                originWhitelist={['*']}
                source={{ html: htmlContent }}
                style={styles.webview}
              />
            </View>
          </>
        )}

        <View style={styles.spacer} />
        <Button title="Ligar LED" onPress={() => enviarComando('ligar')} />
        <View style={styles.spacer} />
        <Button title="Desligar LED" onPress={() => enviarComando('desligar')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#F0F8FF',
  },
  container: {
    padding: 24,
    justifyContent: 'center',
  },
  ipText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
    color: '#555',
  },
  serialText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  htmlPreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  webviewContainer: {
    height: 200,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
  },
  spacer: {
    height: 16,
  },
});