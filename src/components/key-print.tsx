import React from 'react';
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#E4E4E4'
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  }
});

import { PDFViewer } from '@react-pdf/renderer';


// Create Document Component
export function KeyPrint ({ key, databaseId }: { key: string, databaseId: string }) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                  <Text>Key: {key}</Text>
                </View>
                <View style={styles.section}>
                  <Text>Database Id: {databaseId}</Text>
                </View>
            </Page>
        </Document>
    );
}