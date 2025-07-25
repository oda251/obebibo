Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Root route
  root "campaigns#index"

  # Authentication routes
  devise_for :users, path: '', path_names: {
    sign_in: 'login',
    sign_out: 'logout',
    sign_up: 'register'
  }
  
  devise_for :admins, path: 'admin', path_names: {
    sign_in: 'login',
    sign_out: 'logout'
  }

  # User-facing routes
  resources :campaigns, only: [:index, :show] do
    member do
      get :entry, to: 'entries#new'
      post :entry, to: 'entries#create'
      get 'entry/done', to: 'entries#done'
      resources :reviews, only: [:create, :index]
    end
  end

  get 'mypage', to: 'users#show'
  namespace :mypage do
    get 'review/:id', to: 'reviews#new', as: 'review'
    post 'review/:id', to: 'reviews#create'
  end

  # Static pages
  get 'terms', to: 'pages#terms'
  get 'privacy', to: 'pages#privacy'
  get 'inquiry', to: 'pages#inquiry'
  post 'inquiry', to: 'pages#create_inquiry'

  # Admin routes
  namespace :admin do
    root 'dashboard#index'
    resources :campaigns do
      member do
        get :entries
      end
    end
    resources :entries, only: [:index, :show, :update]
    resources :shipments, only: [:index, :show, :update]
    resources :reviews, only: [:index, :show, :destroy]
  end

  # API routes
  namespace :api do
    resources :campaigns, only: [:index, :show] do
      member do
        post :entry
        get :reviews
        post :reviews
      end
    end
    
    namespace :users do
      get 'me', to: 'users#show'
      get 'me/entries', to: 'users#entries'
      get 'me/reviews', to: 'users#reviews'
    end
    
    namespace :auth do
      post :register, to: 'auth#register'
      post :login, to: 'auth#login'
      post :logout, to: 'auth#logout'
    end
    
    namespace :admin do
      resources :campaigns
      resources :entries, only: [:index, :show, :update]
      resources :shipments, only: [:index, :update]
      resources :reviews, only: [:index]
    end
  end
end