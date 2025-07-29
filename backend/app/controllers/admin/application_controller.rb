class Admin::ApplicationController < ApplicationController
  before_action :authenticate_admin!
  before_action :require_admin!
  layout 'admin'

  private

  def require_admin!
    redirect_to new_admin_session_path unless admin_signed_in?
  end
end