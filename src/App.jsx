import { useState } from 'react'
import './index.css'
import { supabase } from './lib/supabase'
import WelcomeScreen from './screens/WelcomeScreen'
import QuizScreen from './screens/QuizScreen'
import ResultScreen from './screens/ResultScreen'
import MapScreen from './screens/MapScreen'

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome')
  const [userData, setUserData] = useState(null)
  const [quizResult, setQuizResult] = useState(null)

  const handleStart = (formData) => {
    setUserData(formData)
    setCurrentScreen('quiz')
  }

  // Wylicz średnią z tablicy ocen
  const avg = (arr) => arr?.length
    ? arr.reduce((a, b) => a + b, 0) / arr.length
    : 0

  const handleFinish = async (result) => {
    setQuizResult(result)
    setCurrentScreen('result')

    // Zapisz wynik do Supabase
    const { error } = await supabase
      .from('users_results')
      .insert({
        name:    userData.name,
        age:     Number(userData.age),
        gender:  userData.gender,
        city:    'brak',
        color:   result.color,
        score_a: avg(result.ratings.A),
        score_b: avg(result.ratings.B),
        score_c: avg(result.ratings.C),
        score_d: avg(result.ratings.D),
        score_e: avg(result.ratings.E),
      })

    if (error) console.error('Błąd zapisu:', error)
    else console.log('✅ Wynik zapisany!')
  }

  const handleShowMap = () => {
    setCurrentScreen('map')
  }

  // Dane aktualnego użytkownika przekazywane do mapy
  const currentUserForMap = quizResult ? {
    color:   quizResult.color,
    score_a: avg(quizResult.ratings?.A),
    score_b: avg(quizResult.ratings?.B),
    score_c: avg(quizResult.ratings?.C),
    score_d: avg(quizResult.ratings?.D),
    score_e: avg(quizResult.ratings?.E),
  } : null

  return (
    <>
      {currentScreen === 'welcome' && (
        <WelcomeScreen onStart={handleStart} />
      )}
      {currentScreen === 'quiz' && (
        <QuizScreen onFinish={handleFinish} />
      )}
      {currentScreen === 'result' && (
        <ResultScreen
          userData={userData}
          quizResult={quizResult}
          onShowMap={handleShowMap}
        />
      )}
      {currentScreen === 'map' && (
        <MapScreen currentUser={currentUserForMap} />
      )}
    </>
  )
}

export default App