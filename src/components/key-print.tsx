import React from 'react';
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {fontSize: 11,paddingTop: 20,paddingLeft: 40,paddingRight: 40,lineHeight: 1.5,flexDirection: 'column' },
  spaceBetween : {flex : 1,flexDirection: 'row',alignItems:'center',justifyContent:'space-between',color: "#3E3E3E" },
  titleContainer: {flexDirection: 'row',marginTop: 24},
  reportTitle: {  fontSize: 16,  textAlign: 'center' },
  title : {fontSize: 11,fontStyle: 'bold'}, 
  value : { fontWeight: 400, fontSize: 10, fontFamily: 'Courier'},

})

const Br = () => "\n";

// Create Document Component
export function KeyPrint ({ key, databaseId }: { key: string, databaseId: string }) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
              <View style={styles.titleContainer}>
                  <View style={styles.spaceBetween}>
                      <Text style={styles.reportTitle}>Patient Pad Recovery Kit</Text>
                  </View>
              </View>
              <View style={styles.titleContainer}>
                <View style={styles.spaceBetween}>
                    <View style={{maxWidth : 400}}>
                        <Text style={styles.title}>Database Id:</Text>
                        <Text style={styles.value}>
                            {databaseId}
                        </Text>
                    </View>
                </View>
              </View>    
              <View style={styles.titleContainer}>
                <View style={styles.spaceBetween}>
                    <View style={{maxWidth : 400}}>
                        <Text style={styles.title}>Key Id:</Text>
                        <Text style={styles.value}>
                            {key}
                        </Text>
                    </View>
                </View>
              </View>                           
          </Page>
        </Document>
    );
}