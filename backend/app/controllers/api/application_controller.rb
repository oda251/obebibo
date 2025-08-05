class Api::ApplicationController < ActionController::API
  include ActionController::RequestForgeryProtection
  # Include Devise helpers for authentication
  include Devise::Controllers::Helpers
  
  protect_from_forgery with: :null_session
  # Don't apply authentication globally to avoid conflicts with Devise

  respond_to :json

  private

  def render_error(message, status = :unprocessable_entity)
    render json: { error: message }, status: status
  end

  def render_success(data = {}, message = nil)
    response = data
    response[:message] = message if message
    render json: response
  end

  def authenticate_user!
    render_error('ログインが必要です', :unauthorized) unless user_signed_in?
  end

  def authenticate_admin!
    render_error('管理者権限が必要です', :unauthorized) unless admin_signed_in?
  end
end