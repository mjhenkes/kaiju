Rails.application.routes.draw do # rubocop:disable Metrics/BlockLength
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root 'launch#show'

  resources :launch, only: %i[show]
  resources :users, only: %i[index show] do
    resources :projects, only: %i[index create]
  end
  resources :projects, only: %i[show destroy new] do
    resources :workspaces, only: %i[index show create destroy] do
      resources :components, only: %i[show update destroy] do
        resources :properties, only: %i[show update destroy]
      end
      member do
        put 'name'
        put 'undo'
        put 'redo'
        get 'collaboration_invitation'
        put 'activate'
        get 'code'
        get 'preview'
        get 'ast'
        get 'attributes'
      end
    end
    resources :reference_components, only: %i[index]
    member do
      put 'name'
      get 'collaboration_invitation'
      put 'activate'
    end
  end
  resources :invitations, only: %i[show]
  resources :health, only: %i[index]

  match '/auth', to: 'sessions#index', via: %i[get]
  match '/auth/:provider/callback', to: 'sessions#create', via: %i[get post]
  match '/auth/failure', to: 'sessions#failure', via: %i[get]
  match '/auth/logout', to: 'sessions#destroy', via: %i[get destroy]
end
