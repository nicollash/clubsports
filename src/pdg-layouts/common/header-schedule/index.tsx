import React from 'react';
import { Text, View, Image } from '@react-pdf/renderer';
import TMLogo from 'assets/logo.png';
import { IEventDetails, ISchedule } from 'common/models';
import { styles } from './styles';
import { formatPhoneNumber } from "helpers/formatPhoneNumber";
import { PDFReportType } from 'components/reporting/components/item-schedules';

interface Props {
  event: IEventDetails;
  schedule: ISchedule;
  byPool?: boolean;
  pdfType?: PDFReportType;
  divisionName?: string;
  facilitiesName?: string;
  date?: string;
  scorerMobile: string | null;
}

const HeaderSchedule = ({
  event,
  schedule,
  byPool,
  pdfType,
  divisionName,
  facilitiesName,
  date,
}: Props) => (
  <View style={styles.header} fixed>
    <View style={byPool ? styles.headerWrapperPool : styles.headerWrapper}>
      {byPool ? (
        <>
          <Text style={styles.eventNamePool}>
            {event.event_name} {facilitiesName}
          </Text>
          <Text style={styles.divisionName}>Division: {divisionName}</Text>
          <Text style={styles.divisionDate}>{date}</Text>
        </>
      ) : (
        <>
          <Text style={styles.eventName}>
            {event.event_name} {facilitiesName}
          </Text>
          <Text style={styles.scheduleName}>
            Event Schedule ({`${schedule.schedule_name}`})
          </Text>
          <View style={styles.mainContactWrapper}>
            <View style={styles.mainContactNameWrapper}>
              <Text style={styles.mainContactTitle}>Main Contact:</Text>
              <Text>{event?.main_contact}</Text>
            </View>

            <View style={styles.mainContactNameWrapper}>
              <Text style={styles.mainContactTitle}>Mobile:</Text>
              <Text>{formatPhoneNumber(event?.main_contact_mobile)}</Text>
            </View>

          </View>
          {event.sms_scoring_YN && pdfType === PDFReportType.MASTER_SCHEDULE_FIELD_BY_FIELD ? (
            <View>
              <Text style={styles.scoreResult}>
                Text game result: (206) 888-2314 
                {/* Text game result: {scorerMobile} */}
              </Text>
              <Text style={styles.scoreResult}>
                Format: 8 char game id, away score, home score (e.g.,
                "ABCD1234,2,4")
              </Text>
            </View>
            ) : null
          }
        </>
      )}
    </View>
    <View style={byPool ? styles.logoWrapperPool : styles.logoWrapper}>
      <Image
        src={
          event.desktop_icon_URL
            ? `https://tourneymaster.s3.amazonaws.com/public/${event.desktop_icon_URL}`
            : TMLogo
        }
        style={styles.logo}
      />
    </View>
  </View>
);

export default HeaderSchedule;
