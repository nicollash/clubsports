/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import StepContent from "@material-ui/core/StepContent";
import { ButtonFormTypes, InternalRegType } from "common/enums";
import {
  IEventDetails,
  IRegistration,
  ISelectOption,
  IUSAState,
  ITeamItem,
} from "common/models";
import { IIndividualsRegister, ITeamsRegister } from "common/models/register";
import { getVarcharEight } from "helpers";
import {
  Button,
  HeadingLevelThree,
  Toasts,
  HeadingLevelTwo,
  Loader,
} from "components/common";
import Paper from "components/common/paper";
import Footer from "components/footer";
import { eventTypeOptions } from "components/event-details/event-structure";
import RegistrantName from "./individuals/registrant-name";
import PlayerInfo from "./individuals/player-info";
import PlayerStats from "./individuals/player-stats";
import Payment from "./individuals/payment";
import Team from "./teams/team";
import ContactInfo from "./teams/contact-info";
import CoachInfo from "./teams/coach-info";
import PopupRegistrationType from "./popup-registration-type";
import Header from "./header";
import SideBar from "./side-bar";
import Waiver from "./waiver";
import Confirmation from "./confirmation";
import styles from "./styles.module.scss";
import { trimValue } from "helpers";

axios.defaults.baseURL = process.env.REACT_APP_PUBLIC_API_BASE_URL!;

export enum TypeOptions {
  "Participant (Must be +18 years of age)" = 1,
  "Parent/Guardian" = 2,
  "Team Admin" = 3,
  "Coach" = 4,
}

export enum RegType {
  TEAM = "team",
  INDIVIDUAL = "individual",
}

const getInternalRegType = (type: TypeOptions): RegType => {
  if (
    type === TypeOptions["Participant (Must be +18 years of age)"] ||
    type === TypeOptions["Parent/Guardian"]
  ) {
    return RegType.INDIVIDUAL;
  } else {
    return RegType.TEAM;
  }
};

const getApiEndpointByRegType = (type: TypeOptions) => {
  if (
    type === TypeOptions["Participant (Must be +18 years of age)"] ||
    type === TypeOptions["Parent/Guardian"]
  ) {
    return "/reg_individuals";
  } else {
    return `/reg_teams`;
  }
};

export interface RegisterMatchParams {
  match: {
    params: {
      eventId?: string;
    };
  };
}

export interface IFields {
  fieldName: string;
  fieldValue: string;
  fieldKeyValue?: string;
  fieldDataId: string;
}

export const wrappedRegister = ({ match }: RegisterMatchParams) => {
  const stripePromise = new Promise(async (resolve) => {
    const stripeAccount = (
      await axios.get(`/skus?event_id=${match.params.eventId}`)
    ).data[0].stripe_connect_id;
    const stripe = await loadStripe(
      process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!,
      stripeAccount === "main" ? undefined : { stripeAccount }
    );
    resolve(stripe);
  }) as Promise<Stripe | null>;

  return (
    <Elements stripe={stripePromise}>
      <RegisterPageWithRedux match={match} />
    </Elements>
  );
};

interface RegisterPageProps {
  match: any;
  teams: ITeamItem[];
}

const RegisterPage = ({ match, teams }: RegisterPageProps) => {
  const [event, setEvent] = useState<IEventDetails | null>(null);
  const [
    eventRegistration,
    setEventRegistration,
  ] = useState<IRegistration | null>(null);
  const [divisions, setDivisions] = useState([]);
  const [paymentPlans, setPaymentPlans] = useState([]);
  const [states, setStates] = useState<ISelectOption[]>([]);
  const [type, setType] = React.useState(1);
  const [isOpenModalOpen, toggleModal] = React.useState(true);
  const [activeStep, setActiveStep] = React.useState(0);
  const [purchasing] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState(false);

  const [registration, setRegistration] = useState<
    Partial<IIndividualsRegister> | Partial<ITeamsRegister>
  >({});
  const [customFields, setCustomFields] = useState<IFields[]>([]);
  const [isInvited, setIsInvited] = useState(false);
  const [isDisable, setIsDisable] = useState<boolean>(false);
  const [isCorrectForm, setIsCorrectForm] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [partialRegistration, setPartialRegistration] = useState<any>(null);
  const [resultMessage, setResultMessage] = useState<any>(false);

  const stripe = useStripe()!;
  const elements = useElements();

  let timer: any;
  useEffect(() => {
    if (!isComplete) {
      setProgress(0);
      return;
    }
    timer = setInterval(() => {
      setProgress((prevProgress) =>
        prevProgress >= 100 ? 100 : prevProgress + 10
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [isComplete]);

  const getSteps = () => {
    if (
      type === TypeOptions["Participant (Must be +18 years of age)"] ||
      type === TypeOptions["Parent/Guardian"]
    ) {
      const steps = [
        "Registrant Name",
        "Participant Personal Info",
        "Participant Profile",
        "Waivers & Wellness",
        "Confirm Details and Registration",
        "Payment",
      ];

      if (
        event &&
        event.waivers_required === 1 &&
        eventRegistration?.waiver_content
      ) {
        return steps;
      } else {
        return steps.filter((item) => item !== "Waivers & Wellness");
      }
    } else {
      return [
        "Team(s)",
        "Contact Info",
        "Coach Info",
        "Confirm Details and Registration",
        "Payment",
      ];
    }
  };

  const steps = getSteps();

  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };
  const query = useQuery();

  useEffect(() => {
    const {
      params: { eventId },
    } = match;

    if (query.get("team") || query.get("division")) {
      setIsInvited(true);
      if (getInternalRegType(type) === "individual") {
        onChange("team_id", query.get("team_id")!);
      }
      onChange("team_name", query.get("team")!);
      onChange("division_name", query.get("division")!);
      onChange("ext_sku", "div_" + query.get("division_id")!);
    }

    axios.get("/events").then((response) => {
      const eventData: IEventDetails = response.data.filter(
        (e: IEventDetails) => e.event_id === eventId
      )[0];

      setEvent(eventData);
      setType(
        eventTypeOptions[eventData.event_type] === eventTypeOptions.Showcase
          ? TypeOptions["Participant (Must be +18 years of age)"]
          : TypeOptions["Team Admin"]
      );
    });

    axios.get("/registrations").then((response) => {
      const registrationData = response.data.filter(
        (reg: IRegistration) => reg.event_id === eventId
      )[0];
      setEventRegistration(registrationData);
    });

    axios.get(`/skus?product_id=evn_${eventId}`).then((response) => {
      const divs = response.data.map((sku: any) => ({
        label: sku.sku_name,
        value: sku.sku_id,
      }));

      const sortedDivs = divs.sort((a: ISelectOption, b: ISelectOption) =>
        a.label.localeCompare(b.label, undefined, { numeric: true })
      );

      setDivisions(sortedDivs);
    });

    axios.get("/states").then((response) => {
      const selectStateOptions = response.data.map((it: IUSAState) => ({
        label: it.state_id,
        value: it.state_name,
      }));

      const sortedSelectStateOptions = selectStateOptions.sort(
        (a: ISelectOption, b: ISelectOption) =>
          a.label.localeCompare(b.label, undefined, { numeric: true })
      );

      setStates(sortedSelectStateOptions);
    });
  }, []);

  const saveRegistrationResponse = async (
    registration: Partial<IIndividualsRegister> | Partial<ITeamsRegister>
  ) => {
    const regResponseId = getVarcharEight();
    const updatedRegistration: any = {
      ...registration,
      division_id:
        registration.ext_sku && registration.ext_sku.startsWith("div_")
          ? registration.ext_sku.slice(4)
          : null,
      registration_id: eventRegistration?.registration_id,
      reg_response_id: regResponseId,
    };
    const trimedRegistration = trimValue(updatedRegistration)
      ? trimValue(updatedRegistration)
      : updatedRegistration;
    setRegistration(trimedRegistration);

    try {
      if (
        type === TypeOptions["Participant (Must be +18 years of age)"] ||
        type === TypeOptions["Parent/Guardian"]
      ) {
        const updatedRegistrationPromises: Promise<any>[] = [];
        customFields.forEach((field) => {
          updatedRegistrationPromises.push(
            axios.post(`/registrant_data_response`, {
              request_id: Number(field.fieldName),
              response_value:
                field.fieldKeyValue || trimValue(field.fieldValue),
              reg_response_id: regResponseId,
              data_field_id: field.fieldDataId,
            })
          );
        });
        await Promise.all(updatedRegistrationPromises);
      }
      await axios.post(getApiEndpointByRegType(type), trimedRegistration);
      setIsComplete(true);
      return trimedRegistration;
    } catch (err) {
      setIsComplete(false);
      return Toasts.errorToast(err.message);
    }
  };

  const loadPaymentPlans = async () => {
    return axios
      .get(
        `/payments/payment-plans?sku_id=${
          teams![0].ext_sku || registration.ext_sku
        }${
          registration.discount_code
            ? `&discount_code=${registration.discount_code}`
            : ""
        }`
      )
      .then((response) => {
        const plans = response.data.map((plan: any) => ({
          label: plan.payment_plan_name,
          value: plan.payment_plan_id,
          price: plan.price,
          type: plan.type,
          notice: plan.payment_plan_notice,
        }));
        setPaymentPlans(plans);
        return plans;
      });
  };

  const handleProceedToPayment = async () => {
    loadPaymentPlans().then((plans) => {
      const planWithMinIterations = plans.reduce(
        (prev: any, cur: any) =>
          !cur.iterations ||
          (cur.type === "installment" && prev.iterations < cur.iterations)
            ? prev
            : cur,
        plans[0]
      );
      setRegistration({
        ...registration,
        payment_selection: planWithMinIterations.value,
        payment_method: "Credit Card",
      });
    });
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleNext = (evt: React.FormEvent) => {
    evt.preventDefault();

    if (!isCorrectForm) {
      return;
    }

    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else if (activeStep === steps.length - 3) {
      // TODO: Change step ids to constants
      handleProceedToPayment();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setIsDisable(false);
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const onChange = (name: string, value: string | number) =>
    setRegistration((prevRegistration) => ({
      ...prevRegistration,
      [name]: value,
    }));

  const onChangeCustomFields = (field: IFields) =>
    setCustomFields((prevState: IFields[]) => {
      const filteredState = prevState.filter(
        (f: IFields) => f.fieldName !== field.fieldName
      );
      return [...filteredState, field];
    });

  const fillParticipantInfo = (info: any) =>
    setRegistration({ ...registration, ...info });

  const onTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange("registrant_role", e.target.value);
    setType(Number(TypeOptions[e.target.value]));
  };

  const onTypeSelect = () => toggleModal(false);

  const getStepContent = (step: string) => {
    if (
      type === TypeOptions["Participant (Must be +18 years of age)"] ||
      type === TypeOptions["Parent/Guardian"]
    ) {
      const {
        params: { eventId },
      } = match;

      switch (step) {
        case "Registrant Name":
          return (
            <RegistrantName
              onError={(e: boolean) => setIsCorrectForm(!e)}
              onChange={onChange}
              data={registration}
            />
          );
        case "Participant Personal Info":
          return (
            <PlayerInfo
              onChange={onChange}
              data={registration}
              fillParticipantInfo={fillParticipantInfo}
              divisions={divisions}
              states={states}
              isInvited={isInvited}
              datePickerRequired={
                eventRegistration?.request_athlete_birthdate === 1
              }
              onError={(e) => setIsCorrectForm(!e)}
            />
          );
        case "Participant Profile":
          return (
            <PlayerStats
              data={customFields}
              onChange={onChangeCustomFields}
              eventId={eventId}
              jerseyNumberRequired={
                eventRegistration?.request_athlete_jersey_number === 1
              }
            />
          );
        case "Waivers & Wellness":
          return (
            <Waiver
              data={registration}
              content={eventRegistration}
              onChange={onChange}
              event={event}
              setDisabledButton={(e: boolean) => setIsDisable(e)}
            />
          );
        case "Payment":
          return (
            <Payment
              onChange={onChange}
              data={registration}
              processing={processing}
              purchasing={purchasing}
              paymentSelectionOptions={paymentPlans}
              reloadPaymentPlans={loadPaymentPlans}
            />
          );
        case "Confirm Details and Registration":
          return (
            <Confirmation
              type={InternalRegType.INDIVIDUAL}
              data={registration}
              event={event}
              divisions={divisions}
            />
          );
      }
    } else {
      switch (step) {
        case "Team(s)":
          return (
            <Team
              onChange={onChange}
              data={registration}
              divisions={divisions}
              states={states}
              isInvited={isInvited}
            />
          );
        case "Contact Info":
          return <ContactInfo onChange={onChange} data={registration} />;
        case "Coach Info":
          return <CoachInfo data={registration} />;
        case "Payment":
          return (
            <Payment
              onChange={onChange}
              data={registration}
              processing={processing}
              purchasing={purchasing}
              paymentSelectionOptions={paymentPlans}
              reloadPaymentPlans={loadPaymentPlans}
            />
          );
        case "Confirm Details and Registration":
          return (
            <Confirmation
              type={InternalRegType.TEAM}
              data={registration}
              event={event}
              divisions={divisions}
              teams={teams}
            />
          );
      }
    }
  };

  const handleCustomerActionRequired = async ({
    subscription,
    results,
    invoice,
    priceId,
    paymentMethodId,
    isRetry,
  }: any) => {
    if (subscription && subscription.status === "active") {
      // Subscription is active, no customer actions required.
      return { subscription, results, priceId, paymentMethodId };
    }

    // If it's a first payment attempt, the payment intent is on the subscription latest invoice.
    // If it's a retry, the payment intent will be on the invoice itself.
    const paymentIntent = invoice
      ? invoice.payment_intent
      : subscription.latest_invoice.payment_intent;

    if (
      paymentIntent.status === "requires_action" ||
      (isRetry === true && paymentIntent.status === "requires_payment_method")
    ) {
      return stripe
        .confirmCardPayment(paymentIntent.client_secret, {
          payment_method: paymentMethodId,
        })
        .then((result) => {
          if (result.error) {
            // Start code flow to handle updating the payment details.
            // Display error message in your UI.
            // The card was declined (i.e. insufficient funds, card has expired, etc).
            throw result.error;
          } else {
            if (result.paymentIntent!.status === "succeeded") {
              // Show a success message to your customer.
              // There's a risk of the customer closing the window before the callback.
              // We recommend setting up webhook endpoints later in this guide.
              return {
                priceId,
                subscription,
                results,
                invoice,
                paymentMethodId,
              };
            }
          }
        })
        .catch((error) => {
          throw error;
          // Toasts.errorToast(error.message!);
        });
    } else {
      // No customer action needed.
      return { subscription, results, priceId, paymentMethodId };
    }
  };

  const handlePaymentMethodRequired = ({
    subscription,
    results,
    paymentMethodId,
    priceId,
  }: any) => {
    if (subscription.status === "active") {
      // subscription is active, no customer actions required.
      return { subscription, results, priceId, paymentMethodId };
    } else if (
      subscription.latest_invoice.payment_intent.status ===
      "requires_payment_method"
    ) {
      // Using localStorage to manage the state of the retry here,
      // feel free to replace with what you prefer.
      // Store the latest invoice ID and status.
      localStorage.setItem("latestInvoiceId", subscription.latest_invoice.id);
      localStorage.setItem(
        "latestInvoicePaymentIntentStatus",
        subscription.latest_invoice.payment_intent.status
      );
      throw new Error("Your card was declined.");
    } else {
      return { subscription, results, priceId, paymentMethodId };
    }
  };

  const createSubscription = async (subscriptionData: any) => {
    return (
      axios
        .post("/payments/create-subscription", subscriptionData)
        // If the card is declined, display an error to the user.
        .then((results) => {
          if (!results.data.success) {
            // The card had an error when trying to attach it to a customer.
            throw new Error(results.data.message);
          }
          return results.data;
        })
        // Normalize the result to contain the object returned by Stripe.
        // Add the addional details we need.
        .then((results) => {
          return {
            paymentMethodId: subscriptionData.paymentMethodId,
            priceId: subscriptionData.items[0].payment_plan_id,
            results,
            subscription: results.subscriptions[0].value,
          };
        })
        // Some payment methods require a customer to be on session
        // to complete the payment process. Check the status of the
        // payment intent to handle these actions.
        .then(handleCustomerActionRequired)
        // If attaching this card to a Customer object succeeds,
        // but attempts to charge the customer fail, you
        // get a requires_payment_method error.
        .then(handlePaymentMethodRequired)
        // No more actions required. Provision your service for the user.
        .then(onSubscriptionComplete)
        .catch((error) => {
          // An error has happened. Display the failure to the user here.
          // We utilize the HTML element we created.
          throw error;
        })
    );
  };

  const onSubscriptionComplete = async ({ results, subscription }: any) => {
    // Payment was successful.
    if (results.partial) {
      Toasts.errorToast(
        "Some teams have not been registered. Please contact the event organizer"
      );
      setPartialRegistration(results.subscriptions);
    }
    if (subscription.status === "active") {
      // Change your UI to show a success message to your customer.
      // Call your backend to grant access to your service based on
      // `result.subscription.items.data[0].price.product` the customer subscribed to.
    }
    return results;
  };

  const handleSubmit = async () => {
    setIsComplete(true);
    try {
      if (!stripe || !elements) {
        setIsComplete(false);
        return Toasts.errorToast("Rats. Something went wrong. Please retry.");
      }
      setProcessing(true);

      const reg = registration as any;
      const reg_type = getInternalRegType(type);

      const regs =
        reg_type === RegType.INDIVIDUAL
          ? [reg]
          : teams.map((team) => {
              const teamNoId = { ...team };
              delete teamNoId.id;
              return {
                ...reg,
                ...teamNoId,
              };
            });

      const updatedRegistrations = await Promise.all(
        regs.map((reg) => saveRegistrationResponse(reg))
      );

      const customer = {
        name:
          (reg.registrant_first_name || reg.contact_first_name) +
          " " +
          (reg.registrant_last_name || reg.contact_last_name),
        email: reg.registrant_email || reg.contact_email,
        phone: reg.registrant_mobile || reg.contact_mobile,
        address: {
          line1: "",
          line2: "",
          city: reg.player_city || reg.team_city,
          state: reg.player_state || reg.team_state,
          country: "US",
          postal_code: "",
        },
      };

      const result = await stripe.createPaymentMethod({
        type: "card",
        card: elements.getElement(CardElement)!,
        billing_details: customer,
      });

      let paymentMethod;
      if (result.error) {
        setProgress(0);
        throw new Error(result.error.message!);
      } else {
        paymentMethod = result.paymentMethod;
      }

      const subscriptionData: any = {
        reg_type,
        registration_id: updatedRegistrations[0].registration_id,
        customer,
        items: updatedRegistrations.map((updatedRegistration) => ({
          registrant:
            reg_type === RegType.TEAM
              ? updatedRegistration.team_name +
                " (" +
                updatedRegistration.division_name +
                ")"
              : updatedRegistration.participant_first_name +
                " " +
                updatedRegistration.participant_last_name,
          reg_response_id: updatedRegistration.reg_response_id,
          sku_id: updatedRegistration.ext_sku,
          payment_plan_id: registration.payment_selection?.replace(
            // Same payment plan for multiple teams registration
            updatedRegistrations[0].ext_sku,
            updatedRegistration.ext_sku
          )!,
          quantity: 1,
          discount_code: updatedRegistration.discount_code,
        })),
        paymentMethodId: paymentMethod!.id,
      };

      subscriptionData.customer.address.postal_code = paymentMethod?.billing_details.address?.postal_code!;

      await createSubscription(subscriptionData);
      Toasts.successToast(`Registration processed!`);
      setResultMessage(
        `Registration completed successfully! A confirmation email has also been sent. Thanks!`
      );

      setProcessing(false);
      setIsComplete(false);
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    } catch (error) {
      setProgress(0);
      setProcessing(false);
      setIsComplete(false);
      if (error.message === "Network Error") {
        setResultMessage(
          `Registration is taking longer than expected. If you do not receive a confirmation email in the next few minutes, please contact the event organizer. You may now close your browser.`
        );
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      } else {
        return Toasts.errorToast(error.message);
      }
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.main}>
        <div className={styles.sideContent}>
          {event && eventRegistration ? (
            <SideBar event={event} eventRegistration={eventRegistration} />
          ) : (
            <Loader />
          )}
        </div>
        <div className={styles.stepperWrapper}>
          <div className={styles.headerStepper}>
            <HeadingLevelTwo>
              {`${TypeOptions[type]} Registration ${
                isInvited
                  ? getInternalRegType(type) === "individual"
                    ? registration.team_name
                      ? "for " + registration.team_name
                      : ""
                    : "for " + registration.division_name
                  : ""
              }`}
            </HeadingLevelTwo>
          </div>
          <div>
            <Paper>
              <Stepper
                activeStep={activeStep}
                orientation="vertical"
                style={{ backgroundColor: "transparent", width: "100%" }}
              >
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>
                      <HeadingLevelThree color="#1c315f">
                        <span>{label}</span>
                      </HeadingLevelThree>
                    </StepLabel>
                    <StepContent>
                      <form onSubmit={handleNext}>
                        <div>{getStepContent(label)}</div>
                        <div className={styles.buttonsWrapper}>
                          <Button
                            disabled={activeStep === 0 || isComplete}
                            onClick={handleBack}
                            label="Back"
                            variant="text"
                            color="secondary"
                          />
                          <Button
                            btnType={ButtonFormTypes.SUBMIT}
                            variant="contained"
                            disabled={processing || isDisable || isComplete}
                            color="primary"
                            label={
                              activeStep === steps.length - 1
                                ? "Agree and Pay"
                                : "Next"
                            }
                          />
                        </div>
                      </form>
                      {processing ? (
                        <div>
                          <Loader value={progress} />
                          <div className={styles.centeredText}>
                            Registration may take several seconds to process,
                            please do not leave the page
                          </div>
                        </div>
                      ) : null}
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
              {activeStep === steps.length && (
                <div className={styles.section}>
                  {partialRegistration ? (
                    <div className={styles.errorMessage}>
                      <h4>Some of the registrations did not complete:</h4>
                      <ul>
                        {partialRegistration.map((reg: any) => {
                          return (
                            <li key={reg.reg_response_id}>
                              {reg.registrant}:{" "}
                              {reg.status === "fulfilled" ? "OK" : reg.reason}
                            </li>
                          );
                        })}
                      </ul>
                      <h4>
                        Please contact support@tourneymaster.org and provide
                        confirmation code:{" "}
                        {partialRegistration[0].reg_response_id}
                      </h4>
                    </div>
                  ) : (
                    <div className={styles.successMessage}>{resultMessage}</div>
                  )}
                </div>
              )}
            </Paper>
          </div>
        </div>
      </div>
      {event && (
        <div className={styles.modalWrapp}>
          <PopupRegistrationType
            event={event}
            isOpenModalOpen={isOpenModalOpen}
            onTypeChange={onTypeChange}
            onTypeSelect={onTypeSelect}
            type={type}
          />
        </div>
      )}
      <div style={{ marginTop: "50px", flex: "0 0 auto" }}>
        <Footer />
      </div>
    </div>
  );
};

const mapStateToProps = (state: { regTeams: { teams: ITeamItem[] } }) => ({
  teams: state.regTeams.teams,
});

const RegisterPageWithRedux = connect(mapStateToProps)(RegisterPage);
export default RegisterPageWithRedux;
