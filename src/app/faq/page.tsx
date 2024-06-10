// src/app/faq/page.tsx
'use client';
import React from 'react';
import { styled } from '@mui/material/styles';
import { Typography, useTheme } from '@mui/material';
import dynamic from 'next/dynamic';

const Accordion = dynamic(() => import('@mui/material').then(mod => mod.Accordion), { ssr: false });
const AccordionSummary = dynamic(() => import('@mui/material').then(mod => mod.AccordionSummary), { ssr: false });
const AccordionDetails = dynamic(() => import('@mui/material').then(mod => mod.AccordionDetails), { ssr: false });
const Paper = dynamic(() => import('@mui/material').then(mod => mod.Paper), { ssr: false });
const ExpandMoreIcon = dynamic(() => import('@mui/icons-material/ExpandMore'), { ssr: false });
const MobileMenu = dynamic(() => import('../../components/MobileMenu'), { ssr: false });
const ScrollToTopButton = dynamic(() => import('../../components/ScrollToTopButton'), { ssr: false });

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
    answer: "WAZAA est une plateforme innovante qui vous permet de découvrir des événements locaux près de chez vous. Grâce à une interface interactive et facile à utiliser, vous pouvez explorer divers événements, les ajouter à vos favoris et ne rien manquer de ce qui se passe autour de vous. Que vous soyez intéressé par des concerts, des expositions, des conférences ou des marchés, WAZAA rassemble toutes ces informations en un seul endroit. De plus, vous avez la possibilité de créer vos propres événements et de les partager avec votre communauté, qu'ils soient publics ou privés."
  },
  {
    question: "Je trouve des événements uniquement dans le Sud-Ouest, pourquoi ?",
    answer: "Nous nous concentrons actuellement sur le Sud-Ouest de la France afin de garantir une expérience utilisateur optimale. Cependant, nous souhaitons étendre le projet et travaillons activement à l'implémentation de notre plateforme à l'échelle nationale. Très bientôt, vous pourrez découvrir des événements dans toute la France. Notre objectif est de couvrir progressivement chaque région pour offrir une découverte locale enrichissante partout où vous allez."
  },
  {
    question: "Une application sera-t-elle disponible ?",
    answer: "Oui, nous sommes en train de développer une application mobile pour WAZAA. Cette application facilitera encore plus la découverte et la gestion des événements. Vous pourrez recevoir des notifications en temps réel, consulter les détails des événements, ajouter des événements à vos favoris et créer vos propres événements directement depuis votre smartphone. L'application sera disponible sur les plateformes iOS et Android."
  },
  {
    question: "Je suis un organisateur, comment créer un événement sur WAZAA ?",
    answer: "Pour créer un événement sur WAZAA, vous devez d'abord créer un profil professionnel. Cliquez sur le bouton Inscription sur notre site, puis sélectionnez l'option pour créer un profil organisateur professionnel. Une fois votre profil configuré, vous pourrez ajouter des événements publics, visibles par tous les utilisateurs de la plateforme, ainsi que des événements privés, accessibles uniquement à ceux que vous invitez. Nous vous offrons tous les outils nécessaires pour gérer efficacement vos événements."
  },
  {
    question: "Un particulier peut-il créer un événement ?",
    answer: "Oui, en tant que particulier, vous pouvez créer des événements sur WAZAA, mais ceux-ci seront par défaut des événements privés. Cela signifie qu'ils ne seront visibles que par les personnes que vous invitez ou celles qui possèdent le lien de l'événement. Si vous souhaitez créer des événements publics, visibles par tous sur la carte publique WAZAA, vous devrez passer par la création d'un profil organisateur. Cela vous permet d'étendre la visibilité de vos événements à un public plus large et bénéficier des outils de gestion professionnels: publicité, statistiques, etc."
  },
  {
    question: "Mon événement est sur WAZAA, mais je ne l'ai pas ajouté. Comment en réclamer la propriété pour le gérer ?",
    answer: "Si vous trouvez un événement sur WAZAA que vous n'avez pas ajouté mais dont vous êtes l'organisateur, vous pouvez en réclamer la propriété. Pour ce faire, contactez-nous par mail à hello@wazaa.app ou via la section CONTACT dans le menu latéral de notre site. Fournissez-nous le lien de l'événement en question ainsi que des informations prouvant que vous en êtes le propriétaire. Nous vérifierons les informations et vous attribuerons la gestion de l'événement dans les plus brefs délais."
  },
  {
    question: "L'utilisation de WAZAA est-elle gratuite ?",
    answer: "Oui, l'utilisation de WAZAA est entièrement gratuite. Vous pouvez découvrir des événements, les ajouter à vos favoris et créer vos propres événements sans frais. Cependant, certaines fonctionnalités supplémentaires, telles que les options de publicité et de mise en avant d'événements, sont payantes. Ces fonctionnalités permettent d'accroître la visibilité de vos événements auprès de notre communauté."
  },
  {
    question: "Comment faire la publicité de mon événement, pour qu'il soit davantage visible ?",
    answer: "Pour augmenter la visibilité de votre événement sur WAZAA, plusieurs options de publicité sont disponibles. Vous pouvez choisir parmi des formats tels que des vidéos promotionnelles, des popups, des liens sponsorisés, des mises en avant sur les réseaux sociaux ou encore des logos affichés sur la carte interactive. Pour en savoir plus sur les possibilités de campagnes publicitaires personnalisées et obtenir un devis, contactez-nous par mail à hello@wazaa.app ou via la section CONTACT dans le menu latéral de notre site."
  },
  {
    question: "Quelle est la différence entre un événement privé et public ?",
    answer: "Un événement public est visible par tous les utilisateurs de WAZAA sur la carte publique. Cela inclut des événements tels que des festivals, des concerts, des marchés et des expositions. À l'inverse, un événement privé est uniquement visible par les personnes que vous avez spécifiquement invitées ou celles qui possèdent le lien de l'événement. Les événements privés conviennent parfaitement aux réunions de famille, anniversaires, mariages, et autres événements personnels ou professionnels restreints."
  },
  {
    question: "Est-il possible de contacter un organisateur ?",
    answer: "Nous travaillons actuellement sur cette fonctionnalité pour permettre aux utilisateurs de contacter directement les organisateurs via WAZAA. Cela facilitera la communication pour obtenir des informations supplémentaires sur les événements, poser des questions spécifiques ou discuter de collaborations potentielles. Cette fonctionnalité sera bientôt disponible et vous permettra d'interagir plus facilement avec les organisateurs."
  },
  {
    question: "Sera-t-il possible, à la manière d'un réseau social, de créer une communauté, chatter avec ses amis, etc...?",
    answer: "Oui, nous envisageons d'ajouter des fonctionnalités de réseau social à WAZAA. Cela inclut la possibilité de créer et de rejoindre des communautés, de discuter avec vos amis et d'autres participants aux événements, de partager des photos et des expériences, et bien plus encore. Notre objectif est de faire de WAZAA non seulement une plateforme de découverte d'événements, mais aussi un lieu d'échange et de connexion pour notre communauté."
  },
  {
    question: "Une fonctionnalité billetterie est-elle prévue ?",
    answer: "Oui, nous prévoyons d'intégrer une fonctionnalité de billetterie directement sur WAZAA. Cette fonctionnalité vous permettra d'acheter des billets pour des événements directement depuis notre plateforme, simplifiant ainsi le processus d'achat. Vous pourrez également vendre des billets pour vos propres événements si vous êtes un organisateur. Nous travaillons activement sur cette fonctionnalité et elle sera disponible prochainement."
  },
  {
    question: "Comment vous contacter ?",
    answer: "Vous pouvez nous contacter par mail à hello@wazaa.app ou via la section Contact de notre site. Nous sommes à votre disposition pour répondre à toutes vos questions, vous aider avec l'utilisation de la plateforme, ou discuter de partenariats et opportunités de collaboration. N'hésitez pas à nous écrire, nous vous répondrons dans les plus brefs délais."
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
