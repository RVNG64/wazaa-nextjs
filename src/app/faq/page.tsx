// src/app/faq/page.tsx
import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Paper, useTheme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/material/styles';
import MobileMenu from '../../components/MobileMenu';
import ScrollToTopButton from '../../components/ScrollToTopButton';

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: `0 2px 6px ${theme.palette.grey[500]}`,
  margin: theme.spacing(2, 0),
  '&:before': { display: 'none' },
  transition: 'box-shadow 0.3s ease',
  '&:hover': { boxShadow: `0 4px 12px ${theme.palette.grey[500]}`, },
  '&.Mui-expanded': { boxShadow: `0 6px 16px ${theme.palette.grey[500]}`, },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  transition: 'background-color 0.3s ease',
  '&:hover': { backgroundColor: theme.palette.primary.dark },
  '& .MuiAccordionSummary-expandIcon': { transform: 'rotate(0deg)', transition: 'transform 0.3s ease', '&.Mui-expanded': { transform: 'rotate(180deg)' } },
}));

const faqs = [
  {
    question: "Quel est le principe de WAZAA ?",
    answer: "WAZAA est une plateforme permettant de découvrir des événements autour de vous, les ajouter à vos favoris, tout avec une interface interactive et facile à utiliser. Pour ne plus rien manquer des événements autour de vous. Vous pouvez également créer vos propres événements et les partager avec votre communauté."
  },
  {
    question: "Je trouve des événements uniquement dans le Sud-Ouest, pourquoi ?",
    answer: "Nous travaillons actuellement à l'implémentation au niveau régional puis national. Pour le moment, nous nous concentrons sur le Sud-Ouest afin de fournir la meilleure expérience possible, mais nous serons bientôt disponibles partout en France."
  },
  {
    question: "Une application sera-t-elle disponible ?",
    answer: "Oui, une application est en préparation."
  },
  {
    question: "Je suis un organisateur, comment créer un événement sur WAZAA ?",
    answer: "Pour créer un événement, il est nécessaire de créer un profil professionnel en cliquant sur le bouton Inscription, puis en créant un profil organisateur. Une fois votre profil créé, vous pourrez ajouter des événements publics et privés."
  },
  {
    question: "Un particulier peut-il créer un événement ?",
    answer: "Oui, un particulier peut créer un événement, mais uniquement un événement privé (visible uniquement pour ceux qui y sont invités ou qui ont reçu le lien de l'événement). Pour qu'un événement soit visible par tous sur la carte publique, il est nécessaire de créer un profil organisateur."
  },
  {
    question: "Mon événement est sur WAZAA, mais je ne l'ai pas ajouté. Comment en réclamer la propriété pour le gérer ?",
    answer: "Pour réclamer la propriété d'un événement, contactez-nous par mail (hello@wazaa.app) ou via la section CONTACT (dans le menu latéral) avec le lien de l'événement en question. Nous vous répondrons dans les plus brefs délais."
  },
  {
    question: "L'utilisation de WAZAA est-elle gratuite ?",
    answer: "Oui, l'utilisation de WAZAA est gratuite. Seules certaines fonctionnalités sont payantes, comme la publicité."
  },
  {
    question: "Comment faire la publicité de mon événement, pour qu'il soit davantage visible ?",
    answer: "Il existe plusieurs options : vidéo, popup, lien sponsorisé, mise en avant sur les réseaux sociaux, logo sur la carte... Contactez-nous par mail (hello@wazaa.app) ou via la section CONTACT (dans le menu latéral) pour plus d'informations sur les possibilités de campagnes publicitaires personnalisées."
  },
  {
    question: "Quelle est la différence entre un événement privé et public ?",
    answer: "Un événement public est visible sur la carte publique, alors qu'un événement privé est visible uniquement pour ceux qui y sont invités ou qui ont reçu le lien de l'événement. Les événements privés sont généralement des rendez-vous entre amis, anniversaires, mariages, vacances, événements professionnels..."
  },
  {
    question: "Est-il possible de contacter un organisateur ?",
    answer: "Cette fonctionnalité sera disponible prochainement."
  },
  {
    question: "Sera-t-il possible, à la manière d'un réseau social, de créer une communauté, chatter avec ses amis, etc...?",
    answer: "Oui, c'est une fonctionnalité que nous étudions actuellement."
  },
  {
    question: "Une fonctionnalité billetterie est-elle prévue ?",
    answer: "Oui, nous travaillons actuellement sur l'implémentation d'une fonctionnalité billetterie."
  },
  {
    question: "Comment vous contacter ?",
    answer: "Vous pouvez nous contacter à hello@wazaa.app ou via la section Contact de notre site."
  }
];

const FAQ = () => {
  const theme = useTheme();

  return (
    <>
      <Paper sx={{
        maxWidth: 1200,
        mx: 'auto',
        my: theme.spacing(4),
        p: theme.spacing(3),
        backgroundColor: theme.palette.grey[100],
        borderRadius: theme.shape.borderRadius,
          [theme.breakpoints.down('md')]: { // Styles pour les écrans jusqu'à 'md'
            maxWidth: '100%',
            p: theme.spacing(2),
          }
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            mb: theme.spacing(2),
            textAlign: 'center',
            fontFamily: '"Sora", sans-serif',
            fontWeight: 600,
            [theme.breakpoints.down('sm')]: { // Styles pour les écrans jusqu'à 'sm'
              fontSize: '1.5rem', // Taille de police plus petite
            }
          }}
        >
          Questions fréquemment posées
        </Typography>
        {faqs.map((faq, index) => (
          <StyledAccordion key={index}>
            <StyledAccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index}a-content`}
              id={`panel${index}a-header`}
            >
              <Typography sx={{ fontWeight: 500, fontFamily: '"Sora", sans-serif' }}>{faq.question}</Typography>
            </StyledAccordionSummary>
            <AccordionDetails>
              <Typography sx={{ fontFamily: '"Sora", sans-serif' }}>
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </StyledAccordion>
        ))}
      </Paper>
      <MobileMenu />
      <ScrollToTopButton />
    </>
  );
};

export default FAQ;
