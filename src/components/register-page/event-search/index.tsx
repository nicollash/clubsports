import React, { useState, useEffect } from "react";
import Header from "../header";
import Footer from "components/footer";
import styles from "./styles.module.scss";
import axios from "axios";
import {
  IEventDetails,
  IRegistrationExtended,
  IRegistration,
} from "common/models";
import IteamSearch from "./item-search";

axios.defaults.baseURL = process.env.REACT_APP_PUBLIC_API_BASE_URL!;

const EventSearch = () => {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    axios
      .get("/registrations")
      .then((response) => setRegistrations(response.data));
    axios.get("/events").then((response) => setEvents(response.data));
  }, []);

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const convertedRegistration: IRegistrationExtended[] = [];
  registrations.forEach((registration: IRegistration) => {
    const selectedEvent = events.find(
      (event: IEventDetails) => event.event_id === registration.event_id
    );
    if (selectedEvent) {
      const eventDetail: IEventDetails = selectedEvent;
      convertedRegistration.push({
        ...registration,
        event_name: eventDetail.event_name,
        event_startdate: eventDetail.event_startdate,
        event_enddate: eventDetail.event_enddate,
        is_published_YN: eventDetail.is_published_YN,
        primary_location_city: eventDetail.primary_location_city,
        primary_location_state: eventDetail.primary_location_state,
      });
    }
  });
  const matchedEvents = convertedRegistration.filter(
    (event: IRegistrationExtended) => {
      const startDate = new Date(event.registration_start);
      const endDate = new Date(event.registration_end);
      if (
        event.is_published_YN &&
        event.event_name.toLowerCase().includes(searchValue.toLowerCase()) &&
        event.payments_enabled_YN === 1 &&
        startDate.getTime() < new Date().getTime() &&
        endDate.getTime() > new Date().getTime()
      ) {
        return true;
      }
      return false;
    }
  );

  return (
    <div className={styles.container}>
      <Header />
      <section className={styles.mainSearch}>
        <div className={styles.mainSearchWrapper}>
          <h2 className={styles.mainSearchTitle}>Event Search: </h2>
          <form className={styles.mainSearchForm}>
            <label className={styles.mainSearchFormSearch}>
              <input
                value={searchValue}
                onChange={onSearch}
                type="search"
                placeholder="Tournament/Event Name"
              />
            </label>
            <div className={styles.mainSearchListWrapper}>
              <ul className={styles.mainSearchTournamentList}>
                {searchValue &&
                  matchedEvents.map((it: IRegistrationExtended) => (
                    <IteamSearch event={it} key={it.event_id} />
                  ))}
              </ul>
            </div>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default EventSearch;
