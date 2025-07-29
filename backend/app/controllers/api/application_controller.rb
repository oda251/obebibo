class Api::ApplicationController < ActionController::API
  include ActionController::RequestForgeryProtection
  
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
end