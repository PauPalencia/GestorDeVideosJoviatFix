import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { buildEmbedUrl } from '../utils/video';

type Props = {
  url?: string;
};

const CHROME_UA =
  'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36';

export const VideoPlayer: React.FC<Props> = ({ url }) => {
  if (!url) return <View style={styles.placeholder} />;

  return (
    <WebView
      source={{ uri: buildEmbedUrl(url) }}
      style={styles.web}
      allowsFullscreenVideo
      javaScriptEnabled
      domStorageEnabled
      mediaPlaybackRequiresUserAction={false}
      allowsInlineMediaPlayback
      userAgent={CHROME_UA}
      originWhitelist={['*']}
    />
  );
};

const styles = StyleSheet.create({
  web: { height: 210, borderRadius: 12, overflow: 'hidden' },
  placeholder: { height: 210, borderRadius: 12, backgroundColor: '#101010' },
});
